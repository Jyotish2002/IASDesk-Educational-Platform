const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

// Initialize Razorpay (only if credentials are provided)
let razorpay = null;
console.log('Razorpay environment check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓ Set' : '✗ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✓ Set' : '✗ Missing');

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✓ Razorpay initialized successfully');
  } catch (error) {
    console.error('✗ Razorpay initialization failed:', error.message);
    console.warn('Payment will work in development mode only');
  }
} else {
  console.warn('✗ Razorpay credentials not found in environment variables');
}

// @route   GET /api/payment/test
// @desc    Test payment setup
// @access  Private
router.get('/test', auth, async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).select('_id title price');
    
    res.json({
      success: true,
      message: 'Payment route is working',
      data: {
        user: {
          id: req.user._id,
          phone: req.user.phone
        },
        courses: courses,
        razorpayAvailable: !!razorpay
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed'
    });
  }
});

// @route   POST /api/payment/create-order
// @desc    Create payment order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    console.log('Create order request:', { courseId, userId: req.user._id });

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
      amount: course.price * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: user._id.toString(),
        courseName: course.title
      }
    };

    const order = await razorpay.orders.create(options);

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
      message: 'Payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        course: {
          id: course._id,
          title: course.title,
          price: course.price
        }
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      razorpayAvailable: !!razorpay
    });
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

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log('Signature verification:', {
      body,
      expectedSignature,
      receivedSignature: razorpay_signature,
      match: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      console.log('Payment signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ 
      orderId: razorpay_order_id,
      userId: req.user._id 
    });

    console.log('Payment record lookup:', {
      orderId: razorpay_order_id,
      userId: req.user._id,
      found: !!payment
    });

    if (!payment) {
      console.log('Payment record not found');
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment record
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = 'completed';
    payment.paymentDate = new Date();
    await payment.save();

    // Enroll user in course
    const user = req.user;
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

    res.json({
      success: true,
      message: 'Payment verified and enrollment completed successfully',
      data: {
        paymentId: razorpay_payment_id,
        courseId: courseId
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
