const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const GoogleMeet = require('../models/GoogleMeet');
const { auth } = require('../middleware/auth');

// @route   POST /api/teachers/initial-login
// @desc    Initial login for new teachers (mobile only, no password)
// @access  Public
router.post('/initial-login', async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Find teacher with this mobile
    const teacher = await User.findOne({ 
      mobile: mobile, 
      role: 'teacher',
      isActive: true 
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher account not found. Please contact admin.'
      });
    }

    // Check if profile is complete (has password set)
    if (teacher.password && teacher.isProfileComplete) {
      return res.status(400).json({
        success: false,
        message: 'Profile already complete. Please use regular login with password.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: teacher._id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful. Please complete your profile.',
      data: {
        token,
        user: {
          id: teacher._id,
          mobile: teacher.mobile,
          name: teacher.name,
          email: teacher.email,
          role: teacher.role,
          isProfileComplete: teacher.isProfileComplete,
          subject: teacher.subject
        }
      }
    });
  } catch (error) {
    console.error('Error in teacher initial login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/teachers/login
// @desc    Regular teacher login (mobile + password)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;

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

    // Find teacher
    const teacher = await User.findOne({ 
      mobile: mobile, 
      role: 'teacher',
      isActive: true 
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher account not found'
      });
    }

    // Check if teacher has set up password
    if (!teacher.password || !teacher.isProfileComplete) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile setup first'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, teacher.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Update last seen
    teacher.lastSeen = new Date();
    await teacher.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: teacher._id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: teacher._id,
          mobile: teacher.mobile,
          name: teacher.name,
          email: teacher.email,
          role: teacher.role,
          isProfileComplete: teacher.isProfileComplete,
          subject: teacher.subject,
          experience: teacher.experience,
          bio: teacher.bio,
          specialization: teacher.specialization
        }
      }
    });
  } catch (error) {
    console.error('Error in teacher login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   PUT /api/teachers/complete-profile
// @desc    Complete teacher profile (set name, password, etc.)
// @access  Private (Teachers only)
router.put('/complete-profile', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    const {
      name,
      email,
      password,
      subject,
      experience,
      bio,
      specialization
    } = req.body;

    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const teacher = await User.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update teacher profile
    teacher.name = name.trim();
    teacher.email = email ? email.toLowerCase().trim() : teacher.email;
    teacher.password = hashedPassword;
    teacher.subject = subject ? subject.trim() : teacher.subject;
    teacher.experience = experience || teacher.experience;
    teacher.bio = bio ? bio.trim() : teacher.bio;
    teacher.specialization = specialization || teacher.specialization;
    teacher.isProfileComplete = true;
    teacher.mustChangePassword = false;

    await teacher.save();

    res.json({
      success: true,
      message: 'Profile completed successfully. You can now login with mobile number and password.',
      data: {
        user: {
          id: teacher._id,
          mobile: teacher.mobile,
          name: teacher.name,
          email: teacher.email,
          role: teacher.role,
          isProfileComplete: teacher.isProfileComplete,
          subject: teacher.subject,
          experience: teacher.experience,
          bio: teacher.bio,
          specialization: teacher.specialization
        }
      }
    });
  } catch (error) {
    console.error('Error completing teacher profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/teachers/change-password
// @desc    Change teacher password
// @access  Private (Teachers only)
router.put('/change-password', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const teacher = await User.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, teacher.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    teacher.password = hashedPassword;
    await teacher.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing teacher password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @route   GET /api/teachers/list
// @desc    Get list of teachers for students to chat with
// @access  Private (Students only)
router.get('/list', auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access teacher list'
      });
    }

    // Find all teachers
    const teachers = await User.find({ 
      role: 'teacher',
      isActive: true 
    })
    .select('name email subject experience rating isOnline lastSeen profileImage specialization')
    .sort({ isOnline: -1, name: 1 }); // Online teachers first, then alphabetical

    // Format teacher data
    const formattedTeachers = teachers.map(teacher => ({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject || 'General',
      experience: teacher.experience || 0,
      rating: teacher.rating || 0,
      isOnline: teacher.isOnline || false,
      lastSeen: teacher.lastSeen,
      profileImage: teacher.profileImage,
      specialization: teacher.specialization || []
    }));

    res.json({
      success: true,
      data: {
        teachers: formattedTeachers,
        count: formattedTeachers.length
      }
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teachers'
    });
  }
});

// @route   GET /api/teachers/chats
// @desc    Get chat previews for teachers
// @access  Private (Teachers only)
router.get('/chats', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    const teacherId = req.user.id;

    // Get chat previews using the Message model method
    const chatPreviews = await Message.getChatPreviews(teacherId);

    res.json({
      success: true,
      data: {
        chats: chatPreviews,
        count: chatPreviews.length
      }
    });
  } catch (error) {
    console.error('Error fetching teacher chats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats'
    });
  }
});

// @route   PUT /api/teachers/online-status
// @desc    Update teacher online status
// @access  Private (Teachers only)
router.put('/online-status', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can update online status'
      });
    }

    const { isOnline } = req.body;
    const teacherId = req.user.id;

    // Update teacher's online status
    const updatedTeacher = await User.findByIdAndUpdate(
      teacherId,
      {
        isOnline: isOnline,
        lastSeen: new Date()
      },
      { new: true }
    ).select('name isOnline lastSeen');

    res.json({
      success: true,
      data: {
        teacher: updatedTeacher
      }
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status'
    });
  }
});

// @route   GET /api/teachers/profile/:teacherId
// @desc    Get teacher profile details
// @access  Private
router.get('/profile/:teacherId', auth, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId)
      .select('name email subject experience rating isOnline lastSeen profileImage specialization bio')
      .populate('courses', 'title description');

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: {
        teacher: teacher
      }
    });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teacher profile'
    });
  }
});

// @route   GET /api/teachers/stats
// @desc    Get teacher statistics (for teacher dashboard)
// @access  Private (Teachers only)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    const teacherId = req.user.id;

    // Get total conversations
    const totalConversations = await Message.distinct('senderId', {
      receiverId: teacherId
    }).countDocuments();

    // Get unread messages count
    const unreadMessages = await Message.getUnreadCount(teacherId);

    // Get total messages received today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMessages = await Message.countDocuments({
      receiverId: teacherId,
      timestamp: { $gte: today }
    });

    // Get active students (who sent messages in last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const activeStudents = await Message.distinct('senderId', {
      receiverId: teacherId,
      timestamp: { $gte: lastWeek }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalConversations,
          unreadMessages,
          todayMessages,
          activeStudents: activeStudents.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/teachers/meet-sessions
// @desc    Get assigned Google Meet sessions for teacher
// @access  Private (Teachers only)
router.get('/meet-sessions', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    const teacherId = req.user.id;

    // Find all Google Meet sessions assigned to this teacher
    const meetSessions = await GoogleMeet.find({
      assignedTeachers: { $in: [teacherId] },
      status: 'active'
    })
    .populate('assignedTeachers', 'name email')
    .sort({ date: 1, startTime: 1 }); // Sort by date and time

    // Format the sessions for frontend
    const formattedSessions = meetSessions.map(session => ({
      _id: session._id,
      title: session.title,
      description: session.description,
      date: session.date,
      time: session.startTime, // Map startTime to time for frontend compatibility
      startTime: session.startTime,
      endTime: session.endTime,
      meetLink: session.meetLink,
      type: session.type === 'daily-schedule' ? 'daily' : 'live',
      subject: session.subject,
      courseTitle: session.subject || 'General Session', // Add courseTitle
      maxParticipants: session.maxParticipants,
      assignedTeachers: session.assignedTeachers,
      isActive: session.status === 'active',
      createdAt: session.createdAt
    }));

    res.json({
      success: true,
      data: {
        sessions: formattedSessions,
        count: formattedSessions.length
      }
    });
  } catch (error) {
    console.error('Error fetching teacher meet sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching meet sessions'
    });
  }
});

module.exports = router;
