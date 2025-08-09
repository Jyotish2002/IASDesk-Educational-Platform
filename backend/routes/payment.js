const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');
const { razorpay, isLiveMode } = require('../config/razorpay');

// @route   GET /api/payment/status
// @desc    Get payment gateway status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).select('_id title price');
    
    console.log('🔴 PAYMENT STATUS: FORCED LIVE MODE');
    
    res.json({
      success: true,
      message: 'Payment gateway is active - LIVE MODE',
      data: {
        user: {
          id: req.user._id,
          phone: req.user.phone
        },
        courses: courses,
        razorpayAvailable: !!razorpay,
        mode: 'live',
        environment: 'production',
        paymentType: 'real',
        isDemo: false,
        isTest: false,
        isLive: true
      }
    });
  } catch (error) {
    console.error('Payment status endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment gateway error'
    });
  }
});

// @route   POST /api/payment/create-order
// @desc    Create payment order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { courseId, amount } = req.body;

    // Force live mode
    const forcedLiveMode = true;
    
    // Validate amount (minimum ₹1 for live transactions)
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount for transactions is ₹1.00'
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Check if course exists
    const course = await Course.findOne({ 
      _id: courseId, 
      isActive: true 
    });

    console.log('Course lookup result:', course ? 'Found' : 'Not found');
    if (!course) {
      console.log('Available courses:', await Course.find({ isActive: true }).select('_id title'));
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is already enrolled
    const user = req.user;
    const alreadyEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not available. Please check Razorpay configuration.'
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `IASDesk_LIVE_${Date.now()}`,
      payment_capture: 1,
      notes: {
        courseId,
        userId: req.user.id,
        platform: 'IASDesk',
        environment: 'production',
        mode: 'live'
      }
    };

    const order = await razorpay.orders.create(options);

    // Log for live transactions
    console.log(`🔴 LIVE ORDER CREATED: ${order.id} for ₹${amount}`);
    console.log('💰 REAL MONEY TRANSACTION - Live payment processing');

    // Save payment record
    const payment = new Payment({
      userId: user._id,
      courseId: courseId,
      amount: course.price,
      currency: 'INR',
      paymentGateway: 'razorpay',
      orderId: order.id,
      status: 'pending'
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Live payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        mode: 'live',
        environment: 'production',
        paymentType: 'real',
        isDemo: false,
        isTest: false,
        isLive: true,
        course: {
          id: course._id,
          title: course.title,
          price: course.price
        }
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order: ' + error.message
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify payment and enroll user
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      courseId 
    } = req.body;

    console.log('Payment verification request:', {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature: razorpay_signature ? 'Present' : 'Missing',
      courseId,
      userId: req.user._id
    });

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !courseId) {
      console.log('Missing required payment parameters');
      return res.status(400).json({
        success: false,
        message: 'Missing required payment parameters'
      });
    }

    // Verify signature first
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log('Payment signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Fetch payment details from Razorpay to verify actual payment
    let razorpayPayment;
    try {
      razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
      console.log('Razorpay payment details:', {
        id: razorpayPayment.id,
        status: razorpayPayment.status,
        amount: razorpayPayment.amount,
        method: razorpayPayment.method,
        captured: razorpayPayment.captured
      });
    } catch (error) {
      console.error('Failed to fetch payment from Razorpay:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify payment with Razorpay'
      });
    }

    // Verify payment status is captured/authorized
    if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
      console.log('Payment not captured/authorized:', razorpayPayment.status);
      return res.status(400).json({
        success: false,
        message: `Payment not successful. Status: ${razorpayPayment.status}`
      });
    }

    // Find payment record in database
    const payment = await Payment.findOne({ 
      orderId: razorpay_order_id,
      userId: req.user._id 
    });

    if (!payment) {
      console.log('Payment record not found');
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify amounts match
    if (razorpayPayment.amount !== payment.amount * 100) {
      console.log('Amount mismatch:', {
        razorpayAmount: razorpayPayment.amount,
        expectedAmount: payment.amount * 100
      });
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch'
      });
    }

    // Check if payment is already processed
    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed'
      });
    }

    // Update payment record
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = 'completed';
    payment.paymentDate = new Date();
    payment.paymentMethod = razorpayPayment.method;
    await payment.save();

    // Check if user is already enrolled (double check)
    const user = req.user;
    const alreadyEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Enroll user in course only after successful payment verification
    user.enrolledCourses.push({
      courseId: courseId,
      paymentId: razorpay_payment_id,
      enrolledAt: new Date()
    });
    await user.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    // Enhanced logging for live payments
    console.log(`🔴 LIVE PAYMENT VERIFIED & ENROLLED: ${razorpay_payment_id} - Amount: ₹${razorpayPayment.amount/100} - Method: ${razorpayPayment.method}`);
    console.log('💰 REAL MONEY TRANSACTION COMPLETED');

    res.json({
      success: true,
      message: 'Live payment verified and enrollment completed successfully',
      data: {
        paymentId: razorpay_payment_id,
        courseId: courseId,
        amount: razorpayPayment.amount / 100,
        method: razorpayPayment.method,
        mode: 'live',
        paymentType: 'real',
        isDemo: false,
        isTest: false,
        isLive: true
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// @route   GET /api/payment/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('courseId', 'title imageURL')
      .select('-__v -signature');

    const total = await Payment.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/payment/webhook
// @desc    Handle Razorpay webhooks
// @access  Public (but secured with webhook signature)
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!secret) {
      return res.status(400).json({ message: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    console.log('Webhook event:', event);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Payment was successful
        await Payment.findOneAndUpdate(
          { paymentId: paymentEntity.id },
          { status: 'completed' }
        );
        break;

      case 'payment.failed':
        // Payment failed
        await Payment.findOneAndUpdate(
          { paymentId: paymentEntity.id },
          { status: 'failed' }
        );
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

module.exports = router;
