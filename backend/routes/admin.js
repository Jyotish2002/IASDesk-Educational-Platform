const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Course = require('../models/Course');
const CurrentAffair = require('../models/CurrentAffair');
const User = require('../models/User');
const Payment = require('../models/Payment');
const GoogleMeet = require('../models/GoogleMeet');
const { adminAuth } = require('../middleware/auth');
const { simpleAdminAuth } = require('../middleware/simpleAdminAuth');
const { uploadCourseImage } = require('../config/cloudinary');

// @route   POST /api/admin/courses
// @desc    Add new course (admin only)
// @access  Private (Admin)
router.post('/courses', simpleAdminAuth, uploadCourseImage.single('image'), async (req, res) => {
  try {
    console.log('=== CREATE COURSE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Content-Type:', req.headers['content-type']);
    
    const {
      title,
      description,
      price,
      category,
      duration,
      level,
      features,
      curriculum,
      instructor
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, price, category'
      });
    }

    // Get image URL from uploaded file or use default
    let imageURL = '/api/placeholder/400/250'; // Default image
    if (req.file) {
      imageURL = req.file.path; // Cloudinary URL
    }

    // Parse JSON fields if they come as strings from FormData
    let parsedFeatures = features;
    let parsedCurriculum = curriculum;
    let parsedInstructor = instructor;

    try {
      if (typeof features === 'string') {
        parsedFeatures = JSON.parse(features);
      }
      if (typeof curriculum === 'string') {
        parsedCurriculum = JSON.parse(curriculum);
      }
      if (typeof instructor === 'string') {
        parsedInstructor = JSON.parse(instructor);
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Use defaults if parsing fails
      parsedFeatures = parsedFeatures || ['Live Classes', 'Study Material', 'Test Series'];
      parsedCurriculum = parsedCurriculum || [];
      parsedInstructor = parsedInstructor || { name: 'IASDesk Expert Faculty', bio: 'Expert instructor' };
    }

    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      imageURL: imageURL,
      price: parseFloat(price),
      originalPrice: price ? Math.round(parseFloat(price) * 1.5) : undefined, // Auto-calculate original price
      category: category.trim(),
      duration: duration || '6 months',
      level: level || 'Beginner',
      features: parsedFeatures || ['Live Classes', 'Study Material', 'Test Series'],
      curriculum: parsedCurriculum || [],
      instructor: parsedInstructor || { name: 'IASDesk Expert Faculty', bio: 'Expert instructor' },
      createdBy: req.user?._id, // Now using proper ObjectId from middleware
      isActive: true
    });

    await course.save();

    console.log('Course created successfully:', {
      id: course._id,
      title: course.title,
      category: course.category,
      price: course.price
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Create course error:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course with this title already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   PUT /api/admin/courses/:id
// @desc    Update course (admin only)
// @access  Private (Admin)
router.put('/courses/:id', simpleAdminAuth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const updateFields = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateFields._id;
    delete updateFields.createdBy;
    delete updateFields.createdAt;
    delete updateFields.updatedAt;

    const course = await Course.findByIdAndUpdate(
      courseId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   DELETE /api/admin/courses/:id
// @desc    Delete course (admin only)
// @access  Private (Admin)
router.delete('/courses/:id', simpleAdminAuth, async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/admin/courses
// @desc    Get all courses including inactive (admin only)
// @access  Private (Admin)
router.get('/courses', simpleAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name mobile')
      .select('-__v');

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/admin/current-affairs
// @desc    Add current affair (admin only)
// @access  Private (Admin)
router.post('/current-affairs', simpleAdminAuth, async (req, res) => {
  try {
    console.log('=== CREATE CURRENT AFFAIR DEBUG ===');
    console.log('Request body:', req.body);
    
    const {
      title,
      content,
      summary,
      category,
      tags,
      isActive
    } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, content, category'
      });
    }

    // Parse tags if it comes as array or string
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    const currentAffair = new CurrentAffair({
      title: title.trim(),
      content: content.trim(),
      summary: summary ? summary.trim() : '',
      category: category.trim(),
      tags: parsedTags,
      isActive: isActive === 'true' || isActive === true || isActive === 'on',
      createdBy: req.user._id
    });

    await currentAffair.save();

    res.status(201).json({
      success: true,
      message: 'Current affair created successfully',
      data: currentAffair
    });
  } catch (error) {
    console.error('Create current affair error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/current-affairs/:id
// @desc    Update current affair (admin only)
// @access  Private (Admin)
router.put('/current-affairs/:id', simpleAdminAuth, async (req, res) => {
  try {
    console.log('=== UPDATE CURRENT AFFAIR DEBUG ===');
    console.log('Request body:', req.body);
    
    const currentAffairId = req.params.id;
    const {
      title,
      content,
      summary,
      category,
      tags,
      isActive
    } = req.body;

    // Prepare update fields
    const updateFields = {
      title: title?.trim(),
      content: content?.trim(),
      summary: summary?.trim(),
      category: category?.trim(),
      isActive: isActive === 'true' || isActive === true || isActive === 'on'
    };

    // Parse tags if provided
    if (tags) {
      if (Array.isArray(tags)) {
        updateFields.tags = tags;
      } else if (typeof tags === 'string') {
        updateFields.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const currentAffair = await CurrentAffair.findByIdAndUpdate(
      currentAffairId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!currentAffair) {
      return res.status(404).json({
        success: false,
        message: 'Current affair not found'
      });
    }

    res.json({
      success: true,
      message: 'Current affair updated successfully',
      data: currentAffair
    });
  } catch (error) {
    console.error('Update current affair error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/current-affairs/:id
// @desc    Delete current affair (admin only)
// @access  Private (Admin)
router.delete('/current-affairs/:id', simpleAdminAuth, async (req, res) => {
  try {
    const currentAffairId = req.params.id;

    const currentAffair = await CurrentAffair.findByIdAndUpdate(
      currentAffairId,
      { isActive: false },
      { new: true }
    );

    if (!currentAffair) {
      return res.status(404).json({
        success: false,
        message: 'Current affair not found'
      });
    }

    res.json({
      success: true,
      message: 'Current affair deleted successfully'
    });
  } catch (error) {
    console.error('Delete current affair error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/admin/current-affairs
// @desc    Get all current affairs including inactive (admin only)
// @access  Private (Admin)
router.get('/current-affairs', simpleAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const currentAffairs = await CurrentAffair.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name mobile')
      .select('-__v');

    const total = await CurrentAffair.countDocuments(query);

    res.json({
      success: true,
      data: {
        currentAffairs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin current affairs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', simpleAdminAuth, async (req, res) => {
  try {
    // Get various statistics
    const totalUsers = await User.countDocuments({ isVerified: true });
    const totalCourses = await Course.countDocuments({ isActive: true });
    const totalCurrentAffairs = await CurrentAffair.countDocuments({ isActive: true });
    const totalPayments = await Payment.countDocuments({ status: 'completed' });

    // Get meeting link statistics
    const coursesWithMeetLinks = await Course.countDocuments({ 
      isActive: true, 
      meetLink: { $exists: true, $ne: '' } 
    });

    const coursesWithLiveSessions = await Course.countDocuments({ 
      isActive: true, 
      'liveSessions.0': { $exists: true } 
    });

    // Get total live sessions count
    const liveSessions = await Course.aggregate([
      { $match: { isActive: true, 'liveSessions.0': { $exists: true } } },
      { $unwind: '$liveSessions' },
      { $match: { 'liveSessions.isActive': true } },
      { $count: 'totalLiveSessions' }
    ]);
    const totalLiveSessions = liveSessions.length > 0 ? liveSessions[0].totalLiveSessions : 0;

    // Get revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get recent enrollments
    const recentEnrollments = await Payment.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'mobile name')
      .populate('courseId', 'title')
      .select('amount createdAt');

    // Get course enrollment stats
    const courseStats = await Course.aggregate([
      { $match: { isActive: true } },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 },
      { $project: { title: 1, enrollmentCount: 1 } }
    ]);

    // Get courses with meeting links for admin overview
    const coursesWithMeeting = await Course.find({ 
      isActive: true, 
      $or: [
        { meetLink: { $exists: true, $ne: '' } },
        { 'liveSessions.0': { $exists: true } }
      ]
    })
    .select('title meetLink meetSchedule liveSessions')
    .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCourses,
          totalCurrentAffairs,
          totalPayments,
          totalRevenue,
          coursesWithMeetLinks,
          coursesWithLiveSessions,
          totalLiveSessions
        },
        recentEnrollments,
        topCourses: courseStats,
        meetingOverview: {
          regularMeetingLinks: coursesWithMeetLinks,
          liveSessions: totalLiveSessions,
          recentCourses: coursesWithMeeting
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/admin/current-affairs/:id/schedule-meet
// @desc    Schedule Google Meet for current affair (admin only)
// @access  Private (Admin)
router.post('/current-affairs/:id/schedule-meet', simpleAdminAuth, async (req, res) => {
  try {
    const { meetLink, scheduledDate, title } = req.body;

    if (!meetLink) {
      return res.status(400).json({
        success: false,
        message: 'Google Meet link is required'
      });
    }

    const currentAffair = await CurrentAffair.findById(req.params.id);

    if (!currentAffair) {
      return res.status(404).json({
        success: false,
        message: 'Current affair not found'
      });
    }

    // Update the current affair with meet details
    currentAffair.meetLink = meetLink;
    if (scheduledDate) currentAffair.scheduledDate = new Date(scheduledDate);
    if (title) currentAffair.title = title;
    currentAffair.updatedAt = new Date();

    await currentAffair.save();

    res.json({
      success: true,
      message: 'Google Meet scheduled successfully',
      data: { currentAffair }
    });
  } catch (error) {
    console.error('Schedule meet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/users', simpleAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { mobile: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .populate('enrolledCourses.courseId', 'title');

    const total = await User.countDocuments(query);

    // Format users with payment verification info
    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      enrolledCourses: user.enrolledCourses.map(enrollment => ({
        ...enrollment.toObject(),
        hasValidPayment: !!enrollment.paymentId
      })),
      totalEnrollments: user.enrolledCourses.length,
      validEnrollments: user.enrolledCourses.filter(e => e.paymentId).length
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        stats: {
          totalUsers: total,
          totalEnrollments: users.reduce((sum, user) => sum + user.enrolledCourses.length, 0),
          validEnrollments: users.reduce((sum, user) => sum + user.enrolledCourses.filter(e => e.paymentId).length, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/admin/cleanup-enrollments
// @desc    Clean up invalid enrollments (enrollments without payment)
// @access  Private (Admin)
router.post('/cleanup-enrollments', simpleAdminAuth, async (req, res) => {
  try {
    // Find all users with enrollments that don't have paymentId
    const usersWithInvalidEnrollments = await User.find({
      'enrolledCourses.paymentId': { $exists: false }
    });

    let removedCount = 0;
    let affectedUsers = 0;
    
    for (const user of usersWithInvalidEnrollments) {
      // Count enrollments without paymentId
      const invalidEnrollments = user.enrolledCourses.filter(enrollment => !enrollment.paymentId);
      
      if (invalidEnrollments.length > 0) {
        // Filter out enrollments without paymentId
        const validEnrollments = user.enrolledCourses.filter(enrollment => enrollment.paymentId);
        
        user.enrolledCourses = validEnrollments;
        await user.save();
        
        removedCount += invalidEnrollments.length;
        affectedUsers++;
      }
    }

    res.json({
      success: true,
      message: `Successfully removed ${removedCount} invalid enrollments from ${affectedUsers} users`,
      data: {
        removedCount,
        affectedUsers
      }
    });
  } catch (error) {
    console.error('Error cleaning up enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup enrollments'
    });
  }
});

// @route   DELETE /api/admin/users/:userId/enrollments/:courseId
// @desc    Remove specific enrollment for a user
// @access  Private (Admin)
router.delete('/users/:userId/enrollments/:courseId', simpleAdminAuth, async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove the specific enrollment
    const initialLength = user.enrolledCourses.length;
    user.enrolledCourses = user.enrolledCourses.filter(
      enrollment => enrollment.courseId.toString() !== courseId
    );

    if (user.enrolledCourses.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Enrollment removed successfully'
    });
  } catch (error) {
    console.error('Error removing enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove enrollment'
    });
  }
});

// @route   GET /api/admin/payments
// @desc    Get all payments
// @access  Private (Admin)
router.get('/payments', simpleAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('userId', 'mobile name email')
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    // Calculate revenue stats
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 }
        } 
      }
    ]);

    const revenue = revenueStats.length > 0 ? revenueStats[0] : { totalRevenue: 0, totalTransactions: 0 };

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        stats: {
          totalPayments: total,
          totalRevenue: revenue.totalRevenue,
          completedTransactions: revenue.totalTransactions
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// @route   PUT /api/admin/courses/:id/schedule
// @desc    Set daily schedule for course (admin only)
// @access  Private (Admin)
router.put('/courses/:id/schedule', simpleAdminAuth, async (req, res) => {
  try {
    const { dailyTime, meetLink, timezone, assignedTeachers } = req.body;

    if (!dailyTime || !meetLink) {
      return res.status(400).json({
        success: false,
        message: 'Daily time and meet link are required'
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create or update GoogleMeet session for daily schedule
    const today = new Date();
    const googleMeetSession = new GoogleMeet({
      title: `Daily Class - ${course.title}`,
      description: `Daily scheduled class for ${course.title}`,
      date: today,
      startTime: dailyTime,
      endTime: dailyTime, // For daily schedule, start and end can be same
      meetLink,
      type: 'daily-schedule',
      subject: course.category || course.title,
      assignedTeachers: assignedTeachers || [],
      createdBy: req.user.id,
      status: 'active'
    });

    await googleMeetSession.save();

    // Update course with daily schedule
    course.meetSchedule = {
      dailyTime,
      timezone: timezone || 'Asia/Kolkata',
      isActive: true,
      assignedTeachers: assignedTeachers || [],
      googleMeetId: googleMeetSession._id // Link to GoogleMeet document
    };
    course.meetLink = meetLink;
    course.updatedAt = new Date();

    await course.save();

    res.json({
      success: true,
      message: 'Daily schedule set successfully',
      data: { course, googleMeetSession }
    });
  } catch (error) {
    console.error('Set daily schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   DELETE /api/admin/courses/:id/schedule
// @desc    Delete daily schedule for course (admin only)
// @access  Private (Admin)
router.delete('/courses/:id/schedule', simpleAdminAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete GoogleMeet session if it exists
    if (course.meetSchedule && course.meetSchedule.googleMeetId) {
      await GoogleMeet.findByIdAndDelete(course.meetSchedule.googleMeetId);
    }

    // Clear the daily schedule
    course.meetSchedule = {
      dailyTime: '',
      timezone: 'Asia/Kolkata',
      isActive: false
    };
    course.meetLink = '';
    course.updatedAt = new Date();

    await course.save();

    res.json({
      success: true,
      message: 'Daily schedule deleted successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Delete daily schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/admin/courses/:id/live-session
// @desc    Add live session to course (admin only)
// @access  Private (Admin)
router.post('/courses/:id/live-session', simpleAdminAuth, async (req, res) => {
  try {
    const { date, time, meetLink, title, assignedTeachers } = req.body;

    if (!date || !time || !meetLink || !title) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: date, time, meetLink, title'
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Initialize liveSessions array if it doesn't exist
    if (!course.liveSessions) {
      course.liveSessions = [];
    }

    // Create session in GoogleMeet collection for teachers
    const googleMeetSession = new GoogleMeet({
      title,
      description: `Live session for ${course.title}`,
      date: new Date(date),
      startTime: time,
      endTime: time, // You might want to add endTime to the form
      meetLink,
      type: 'live-session',
      subject: course.category || course.title,
      assignedTeachers: assignedTeachers || [],
      createdBy: req.user.id,
      status: 'active'
    });

    await googleMeetSession.save();

    // Add new live session to course (keeping existing functionality)
    const newSession = {
      date: new Date(date),
      time,
      meetLink,
      title,
      isActive: true,
      assignedTeachers: assignedTeachers || [],
      googleMeetId: googleMeetSession._id // Link to GoogleMeet document
    };

    course.liveSessions.push(newSession);
    course.updatedAt = new Date();

    await course.save();

    // Populate teacher names for response
    const populatedSession = await GoogleMeet.findById(googleMeetSession._id)
      .populate('assignedTeachers', 'name email');

    res.json({
      success: true,
      message: 'Live session added successfully',
      data: { 
        course,
        googleMeetSession: populatedSession
      }
    });
  } catch (error) {
    console.error('Add live session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   DELETE /api/admin/courses/:courseId/live-session/:sessionId
// @desc    Delete a specific live session from a course (admin only)
// @access  Private (Admin)
router.delete('/courses/:courseId/live-session/:sessionId', simpleAdminAuth, async (req, res) => {
  try {
    const { courseId, sessionId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find the session
    const session = course.liveSessions.find(
      session => session._id.toString() === sessionId
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Live session not found'
      });
    }

    // Delete from GoogleMeet collection if googleMeetId exists
    if (session.googleMeetId) {
      await GoogleMeet.findByIdAndUpdate(session.googleMeetId, { status: 'cancelled' });
    } else {
      // Try to find the session in GoogleMeet collection by other criteria
      await GoogleMeet.updateMany({
        title: session.title,
        date: session.date,
        startTime: session.time
      }, { status: 'cancelled' });
    }

    // Remove the session from course
    course.liveSessions = course.liveSessions.filter(
      s => s._id.toString() !== sessionId
    );
    course.updatedAt = new Date();

    await course.save();

    res.json({
      success: true,
      message: 'Live session deleted successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Delete live session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   DELETE /api/admin/courses/:courseId/live-sessions/all
// @desc    Force delete all live sessions from a course (admin only)
// @access  Private (Admin)
router.delete('/courses/:courseId/live-sessions/all', simpleAdminAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const deletedCount = course.liveSessions ? course.liveSessions.length : 0;

    // Clear all live sessions
    course.liveSessions = [];
    course.updatedAt = new Date();

    await course.save();

    res.json({
      success: true,
      message: `All ${deletedCount} live sessions deleted successfully`,
      data: { course, deletedCount }
    });
  } catch (error) {
    console.error('Force delete all live sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/admin/meeting-links
// @desc    Get all meeting links for admin overview
// @access  Private (Admin)
router.get('/meeting-links', simpleAdminAuth, async (req, res) => {
  try {
    // Get all courses with meeting links or live sessions
    const courses = await Course.find({ 
      isActive: true,
      $or: [
        { meetLink: { $exists: true, $ne: '' } },
        { 'liveSessions.0': { $exists: true } }
      ]
    })
    .select('title meetLink meetSchedule liveSessions category instructor createdAt')
    .populate('createdBy', 'name mobile')
    .sort({ createdAt: -1 });

    // Transform data for frontend
    const meetingData = {
      regularMeetings: [],
      liveSessions: [],
      summary: {
        totalCourses: courses.length,
        coursesWithRegularMeeting: 0,
        totalLiveSessions: 0
      }
    };

    courses.forEach(course => {
      // Regular meeting links
      if (course.meetLink) {
        meetingData.regularMeetings.push({
          courseId: course._id,
          courseTitle: course.title,
          meetLink: course.meetLink,
          schedule: course.meetSchedule?.dailyTime || 'No schedule set',
          category: course.category,
          instructor: course.instructor?.name || 'No instructor',
          createdAt: course.createdAt
        });
        meetingData.summary.coursesWithRegularMeeting++;
      }

      // Live sessions
      if (course.liveSessions && course.liveSessions.length > 0) {
        course.liveSessions.forEach(session => {
          if (session.isActive) {
            meetingData.liveSessions.push({
              sessionId: session._id,
              courseId: course._id,
              courseTitle: course.title,
              sessionTitle: session.title,
              meetLink: session.meetLink,
              scheduledDate: session.date,
              scheduledTime: session.time,
              category: course.category,
              isActive: session.isActive
            });
            meetingData.summary.totalLiveSessions++;
          }
        });
      }
    });

    res.json({
      success: true,
      data: meetingData
    });
  } catch (error) {
    console.error('Get meeting links error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// ===== TEACHER MANAGEMENT ROUTES =====

// @route   POST /api/admin/create-teacher
// @desc    Create a new teacher account with just mobile number
// @access  Private (Admin only)
router.post('/create-teacher', simpleAdminAuth, async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate required fields
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    // Validate mobile number
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobile: mobile });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this mobile number already exists'
      });
    }

    // Create teacher account with minimal info
    const teacher = new User({
      name: '', // Empty initially, teacher will set this
      email: '', // Empty initially, teacher can set this
      mobile: mobile.trim(),
      password: '', // No password initially
      role: 'teacher',
      isVerified: true,
      isActive: true,
      isProfileComplete: false, // Flag to indicate profile needs completion
      subject: '',
      experience: 0,
      bio: '',
      specialization: [],
      rating: 0,
      isOnline: false
    });

    await teacher.save();

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully. Teacher can now login with mobile number.',
      data: {
        teacher: {
          id: teacher._id,
          mobile: teacher.mobile,
          role: teacher.role,
          isProfileComplete: teacher.isProfileComplete
        }
      }
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating teacher account'
    });
  }
});

// @route   GET /api/admin/teachers
// @desc    Get all teachers
// @access  Private (Admin only)
router.get('/teachers', simpleAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    
    // Build search query
    let searchQuery = { role: 'teacher' };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      searchQuery.isActive = status === 'active';
    }

    const teachers = await User.find(searchQuery)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        teachers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
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

// @route   PUT /api/admin/teacher/:id
// @desc    Update teacher details
// @access  Private (Admin only)
router.put('/teacher/:id', simpleAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      subject,
      experience,
      bio,
      specialization,
      isActive
    } = req.body;

    const teacher = await User.findOne({ _id: id, role: 'teacher' });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Update fields
    if (name) teacher.name = name.trim();
    if (email) teacher.email = email.toLowerCase().trim();
    if (subject) teacher.subject = subject.trim();
    if (experience !== undefined) teacher.experience = experience;
    if (bio !== undefined) teacher.bio = bio.trim();
    if (specialization) teacher.specialization = specialization;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: {
        teacher: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          subject: teacher.subject,
          experience: teacher.experience,
          bio: teacher.bio,
          specialization: teacher.specialization,
          isActive: teacher.isActive
        }
      }
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating teacher'
    });
  }
});

// @route   DELETE /api/admin/teacher/:id
// @desc    Delete teacher account
// @access  Private (Admin only)
router.delete('/teacher/:id', simpleAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({ _id: id, role: 'teacher' });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Teacher account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting teacher'
    });
  }
});

// @route   POST /api/admin/reset-teacher-password/:id
// @desc    Reset teacher password to mobile number
// @access  Private (Admin only)
router.post('/reset-teacher-password/:id', simpleAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({ _id: id, role: 'teacher' });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Reset password to mobile number
    const tempPassword = teacher.mobile;
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    teacher.password = hashedPassword;
    teacher.mustChangePassword = true;
    await teacher.save();

    res.json({
      success: true,
      message: 'Teacher password reset successfully',
      data: {
        tempPassword: tempPassword
      }
    });
  } catch (error) {
    console.error('Error resetting teacher password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
});

module.exports = router;
