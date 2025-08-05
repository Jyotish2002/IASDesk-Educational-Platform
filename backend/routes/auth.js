const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTP } = require('../utils/sms');
const { generateToken } = require('../utils/jwt');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 OTP requests per windowMs
  message: { 
    success: false, 
    message: 'Too many OTP requests. Please try again later.' 
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to mobile number
// @access  Public
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate mobile number
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.findOneAndDelete({ mobile }); // Remove any existing OTP
    const otpDoc = new OTP({
      mobile,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
    await otpDoc.save();

    // Send OTP via SMS
    const smsResult = await sendOTP(mobile, otp);

    if (smsResult.success) {
      res.json({
        success: true,
        message: 'OTP sent successfully to your mobile number',
        data: { mobile }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and register user
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Validate input
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP'
      });
    }

    // Find and verify OTP
    const otpDoc = await OTP.findOne({
      mobile,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    // Check if user already exists
    let user = await User.findOne({ mobile });

    if (!user) {
      // Create new user
      user = new User({
        mobile,
        isVerified: true
      });
      await user.save();
    } else {
      // Update existing user verification status
      user.isVerified = true;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login with mobile number (after initial verification)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate mobile number
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Find user
    const user = await User.findOne({ mobile, isVerified: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number not registered. Please register first.'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          name: user.name,
          email: user.email,
          enrolledCourses: user.enrolledCourses
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v')
      .populate('enrolledCourses.courseId', 'title price imageURL');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name.trim();
    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
      updateFields.email = email.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;
