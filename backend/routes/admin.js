const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const CurrentAffair = require('../models/CurrentAffair');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { adminAuth } = require('../middleware/auth');
const { simpleAdminAuth } = require('../middleware/simpleAdminAuth');

// @route   POST /api/admin/courses
// @desc    Add new course (admin only)
// @access  Private (Admin)
router.post('/courses', simpleAdminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      imageURL,
      price,
      originalPrice,
      category,
      duration,
      level,
      features,
      curriculum,
      instructor
    } = req.body;

    // Validate required fields
    if (!title || !description || !imageURL || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, imageURL, price, category'
      });
    }

    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      imageURL: imageURL.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category: category.trim(),
      duration,
      level,
      features,
      curriculum,
      instructor,
      createdBy: req.user._id
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Create course error:', error);
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
    const {
      title,
      content,
      category,
      tags,
      imageURL,
      importance
    } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, content, category'
      });
    }

    const currentAffair = new CurrentAffair({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      tags,
      imageURL,
      importance,
      createdBy: req.user._id
    });

    await currentAffair.save();

    res.status(201).json({
      success: true,
      message: 'Current affair created successfully',
      data: { currentAffair }
    });
  } catch (error) {
    console.error('Create current affair error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   PUT /api/admin/current-affairs/:id
// @desc    Update current affair (admin only)
// @access  Private (Admin)
router.put('/current-affairs/:id', simpleAdminAuth, async (req, res) => {
  try {
    const currentAffairId = req.params.id;
    const updateFields = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateFields._id;
    delete updateFields.createdBy;
    delete updateFields.createdAt;
    delete updateFields.updatedAt;

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
      data: { currentAffair }
    });
  } catch (error) {
    console.error('Update current affair error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
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
    const { dailyTime, meetLink, timezone } = req.body;

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

    // Update course with daily schedule
    course.meetSchedule = {
      dailyTime,
      timezone: timezone || 'Asia/Kolkata',
      isActive: true
    };
    course.meetLink = meetLink;
    course.updatedAt = new Date();

    await course.save();

    res.json({
      success: true,
      message: 'Daily schedule set successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Set daily schedule error:', error);
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
    const { date, time, meetLink, title } = req.body;

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

    // Add new live session
    const newSession = {
      date: new Date(date), // Convert string to Date
      time,
      meetLink,
      title,
      isActive: true
    };

    course.liveSessions.push(newSession);
    course.updatedAt = new Date();

    await course.save();

    res.json({
      success: true,
      message: 'Live session added successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Add live session error:', error);
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

module.exports = router;
