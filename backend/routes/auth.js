const express = require('express');
const jwt = require('jsonwebtoken');
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
      .populate('enrolledCourses.courseId', 'title price imageURL instructor category level features curriculum meetLink meetSchedule liveSessions rating isActive');

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

// @route   POST /api/auth/admin/login
// @desc    Admin login with mobile and password
// @access  Public
router.post('/admin/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validate input
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and password are required'
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Find admin user
    const admin = await User.findOne({ 
      mobile, 
      isAdmin: true 
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // For demo purposes, we'll use simple password comparison
    // In production, you should hash passwords with bcrypt
    const validAdminCredentials = {
      '9999999999': 'admin123',
      '8888888888': 'iasdesk2025'
    };

    if (validAdminCredentials[mobile] !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: {
          id: admin._id,
          mobile: admin.mobile,
          name: admin.name || 'Admin',
          email: admin.email,
          isAdmin: admin.isAdmin,
          isVerified: admin.isVerified,
          enrolledCourses: admin.enrolledCourses
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private (requires valid JWT token)
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId || decoded.id).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          mobile: user.mobile,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
          enrolledCourses: user.enrolledCourses,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// ===== TEACHER AUTHENTICATION ROUTES =====

// @route   POST /api/auth/teacher-login
// @desc    Teacher login with email/mobile and password
// @access  Public
router.post('/teacher-login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or mobile

    // Validate input
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Mobile and password are required'
      });
    }

    // Find teacher by email or mobile
    const teacher = await User.findOne({
      $and: [
        { role: 'teacher' },
        { isActive: true },
        {
          $or: [
            { email: identifier.toLowerCase() },
            { mobile: identifier }
          ]
        }
      ]
    });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or teacher account not found'
      });
    }

    // Check password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, teacher.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last seen and online status
    teacher.lastSeen = new Date();
    teacher.isOnline = true;
    await teacher.save();

    // Generate JWT token
    const token = generateToken(teacher._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          mobile: teacher.mobile,
          role: teacher.role,
          subject: teacher.subject,
          experience: teacher.experience,
          mustChangePassword: teacher.mustChangePassword,
          isVerified: teacher.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/teacher-change-password
// @desc    Change teacher password
// @access  Private (Teacher only)
router.post('/teacher-change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find teacher
    const teacher = await User.findById(req.user.id);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teachers only.'
      });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, teacher.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    teacher.password = hashedNewPassword;
    teacher.mustChangePassword = false;
    await teacher.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @route   POST /api/auth/teacher-logout
// @desc    Teacher logout (update online status)
// @access  Private (Teacher only)
router.post('/teacher-logout', auth, async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id);

    if (teacher && teacher.role === 'teacher') {
      teacher.isOnline = false;
      teacher.lastSeen = new Date();
      await teacher.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Teacher logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// Get all teachers for chat
router.get('/teachers', auth, async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher',
      isProfileComplete: true 
    }).select('name email mobile subject experience bio rating specialization');

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
