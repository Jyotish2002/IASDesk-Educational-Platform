const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const { simpleAdminAuth } = require('../middleware/simpleAdminAuth');
const { uploadCourseImage, deleteImage } = require('../config/cloudinary');

// @route   GET /api/courses
// @desc    Get all public courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice 
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const courses = await Course.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name')
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
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/courses/categories
// @desc    Get all course categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/courses/featured
// @desc    Get featured courses
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredCourses = await Course.find({ 
      isActive: true 
    })
    .sort({ enrollmentCount: -1, rating: -1 })
    .limit(6)
    .populate('createdBy', 'name')
    .select('-__v');

    res.json({
      success: true,
      data: { courses: featuredCourses }
    });
  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.id, 
      isActive: true 
    })
    .populate('createdBy', 'name')
    .select('-__v');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course (after payment)
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const { paymentId } = req.body;
    const courseId = req.params.id;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Check if course exists
    const course = await Course.findOne({ 
      _id: courseId, 
      isActive: true 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is already enrolled
    const user = await User.findById(req.user.id);
    const alreadyEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Add course to user's enrolled courses
    user.enrolledCourses.push({
      courseId,
      paymentId,
      enrolledAt: new Date()
    });
    await user.save();

    // Increment course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in the course',
      data: {
        course: {
          id: course._id,
          title: course.title
        }
      }
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/courses/my/enrolled
// @desc    Get user's enrolled courses
// @access  Private
router.get('/my/enrolled', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title description imageURL price category instructor',
        match: { isActive: true }
      });

    const enrolledCourses = user.enrolledCourses
      .filter(enrollment => enrollment.courseId) // Filter out courses that might have been deleted
      .map(enrollment => ({
        ...enrollment.courseId.toObject(),
        enrolledAt: enrollment.enrolledAt,
        paymentId: enrollment.paymentId
      }));

    res.json({
      success: true,
      data: { courses: enrolledCourses }
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/courses
// @desc    Create a new course (Admin only)
// @access  Private (Admin)
// Create course with optional image upload
router.post('/', simpleAdminAuth, (req, res, next) => {
  // Custom multer middleware with comprehensive error handling
  const upload = uploadCourseImage.single('image');
  
  upload(req, res, (err) => {
    if (err) {
      console.log('File upload error details:', {
        name: err.name,
        message: err.message,
        code: err.code
      });
      
      // Set file to null and continue - don't fail the entire request
      req.file = null;
      req.uploadError = err.message;
      
      // Log specific error types
      if (err.message.includes('Invalid Signature')) {
        console.log('Cloudinary signature error - check API credentials');
      } else if (err.message.includes('File too large')) {
        console.log('File size exceeds limit');
      } else if (err.message.includes('Only image files')) {
        console.log('Invalid file type uploaded');
      }
    }
    next(); // Always continue to the next middleware
  });
}, async (req, res) => {
  try {
    console.log('=== CREATE COURSE REQUEST ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File uploaded:', req.file ? 'YES' : 'NO');
    console.log('Upload error:', req.uploadError || 'None');
    
    if (req.file) {
      console.log('File details:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename
      });
    }
    
    const { title, description, price, category } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, price, and category'
      });
    }

    // Get image URL from uploaded file or use default
    let imageURL = '/api/placeholder/400/300'; // Default placeholder
    let imagePublicId = null;

    if (req.file && req.file.path) {
      // File uploaded successfully via Cloudinary
      imageURL = req.file.path;
      imagePublicId = req.file.filename;
      console.log('Image uploaded to Cloudinary:', imageURL);
    } else {
      console.log('No image uploaded, using default placeholder');
    }

    // Create new course
    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      imageURL,
      imagePublicId,
      // Don't set createdBy for admin courses, it's now optional
      level: 'Beginner',
      features: [
        'Live Google Meet Sessions',
        'One Year Full Access',
        'Mobile & desktop access',
        'Weekly Mock Tests'
      ],
      curriculum: [
        {
          title: 'Course Introduction',
          topics: ['Welcome to the Course', 'Study Plan', 'Resources Overview']
        },
        {
          title: 'Live Sessions Schedule',
          topics: ['Weekly Google Meet Classes', 'Interactive Q&A', 'Expert Guidance']
        }
      ],
      instructor: {
        name: 'IASDesk Expert Faculty',
        bio: 'Experienced educators providing live online sessions and comprehensive support',
        image: '/api/placeholder/100/100'
      }
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('=== CREATE COURSE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course (Admin only)
// @access  Private (Admin)
router.put('/:id', simpleAdminAuth, uploadCourseImage.single('image'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (course.imagePublicId) {
        try {
          await deleteImage(course.imagePublicId);
        } catch (error) {
          console.log('Warning: Could not delete old image:', error.message);
        }
      }
      
      course.imageURL = req.file.path;
      course.imagePublicId = req.file.filename;
    }

    // Update other fields if provided
    if (title) course.title = title.trim();
    if (description) course.description = description.trim();
    if (price) course.price = parseFloat(price);
    if (category) course.category = category.trim();

    await course.save();

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

// @route   DELETE /api/courses/:id
// @desc    Delete course (Admin only)
// @access  Private (Admin)
router.delete('/:id', simpleAdminAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete image from Cloudinary if it exists
    if (course.imagePublicId) {
      try {
        await deleteImage(course.imagePublicId);
      } catch (error) {
        console.log('Warning: Could not delete course image:', error.message);
      }
    }

    // Soft delete - mark as inactive instead of deleting
    course.isActive = false;
    await course.save();

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

// Admin route: Set daily Google Meet schedule for a course
router.put('/:id/schedule', simpleAdminAuth, async (req, res) => {
  try {
    const { dailyTime, meetLink, timezone = "Asia/Kolkata" } = req.body;

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

    course.meetSchedule = {
      dailyTime,
      timezone,
      isActive: true
    };
    course.meetLink = meetLink;

    await course.save();

    res.json({
      success: true,
      message: 'Google Meet schedule updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error updating meet schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin route: Add a live session for a course
router.post('/:id/live-session', simpleAdminAuth, async (req, res) => {
  try {
    const { date, time, meetLink, title } = req.body;

    if (!date || !time || !meetLink || !title) {
      return res.status(400).json({
        success: false,
        message: 'Date, time, meet link, and title are required'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.liveSessions.push({
      date: new Date(date),
      time,
      meetLink,
      title,
      isActive: true
    });

    await course.save();

    res.json({
      success: true,
      message: 'Live session added successfully',
      data: course.liveSessions[course.liveSessions.length - 1]
    });
  } catch (error) {
    console.error('Error adding live session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Student route: Get today's live sessions for enrolled courses
router.get('/my-live-sessions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with enrolled courses
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    if (!user || user.enrolledCourses.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const enrolledCourseIds = user.enrolledCourses.map(enrollment => enrollment.courseId._id);

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find courses with live sessions today
    const coursesWithLiveSessions = await Course.find({
      _id: { $in: enrolledCourseIds },
      $or: [
        {
          'liveSessions': {
            $elemMatch: {
              date: { $gte: today, $lt: tomorrow },
              isActive: true
            }
          }
        },
        {
          'meetSchedule.isActive': true,
          meetLink: { $exists: true, $ne: '' }
        }
      ]
    });

    const liveSessions = [];

    coursesWithLiveSessions.forEach(course => {
      // Add scheduled daily sessions
      if (course.meetSchedule && course.meetSchedule.isActive && course.meetLink) {
        liveSessions.push({
          courseId: course._id,
          courseTitle: course.title,
          type: 'daily',
          time: course.meetSchedule.dailyTime,
          meetLink: course.meetLink,
          title: `Daily Class - ${course.title}`,
          isLive: true
        });
      }

      // Add specific live sessions for today
      course.liveSessions.forEach(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        
        if (sessionDate.getTime() === today.getTime() && session.isActive) {
          liveSessions.push({
            courseId: course._id,
            courseTitle: course.title,
            type: 'specific',
            time: session.time,
            meetLink: session.meetLink,
            title: session.title,
            sessionId: session._id,
            isLive: true
          });
        }
      });
    });

    res.json({
      success: true,
      data: liveSessions
    });
  } catch (error) {
    console.error('Error fetching live sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Student route: Get live sessions for a specific course
router.get('/:id/live-sessions', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Check if user is enrolled in this course
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(enrollment => 
      enrollment.courseId.toString() === courseId
    );
    
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const liveSessions = [];

    // Add daily scheduled session if active
    if (course.meetSchedule && course.meetSchedule.isActive && course.meetLink) {
      liveSessions.push({
        type: 'daily',
        time: course.meetSchedule.dailyTime,
        meetLink: course.meetLink,
        title: `Daily Class - ${course.title}`,
        isLive: true
      });
    }

    // Add today's specific sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    course.liveSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === today.getTime() && session.isActive) {
        liveSessions.push({
          type: 'specific',
          time: session.time,
          meetLink: session.meetLink,
          title: session.title,
          sessionId: session._id,
          isLive: true
        });
      }
    });

    res.json({
      success: true,
      data: liveSessions
    });
  } catch (error) {
    console.error('Error fetching course live sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/courses/live-classes
// @desc    Get live classes for enrolled students
// @access  Private
router.post('/live-classes', async (req, res) => {
  try {
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({
        success: false,
        message: 'Course IDs array is required'
      });
    }

    // In a real implementation, you would fetch from a live_classes collection
    // For demo, we'll generate mock data based on course IDs
    const liveClasses = [];
    
    for (const courseId of courseIds) {
      try {
        const course = await Course.findById(courseId);
        if (course) {
          const today = new Date();
          const todayClass = new Date();
          todayClass.setHours(19, 0, 0, 0); // 7:00 PM today
          
          const tomorrowClass = new Date();
          tomorrowClass.setDate(tomorrowClass.getDate() + 1);
          tomorrowClass.setHours(19, 0, 0, 0); // 7:00 PM tomorrow
          
          liveClasses.push({
            id: `live-${courseId}-today`,
            courseId: courseId,
            courseTitle: course.title,
            meetLink: course.meetLink || 'https://meet.google.com/abc-defg-hij',
            scheduledTime: todayClass.toISOString(),
            description: `Today's live session for ${course.title}`,
            isActive: today >= todayClass && today <= new Date(todayClass.getTime() + 2 * 60 * 60 * 1000),
            attendees: Math.floor(Math.random() * 100) + 20
          });
          
          liveClasses.push({
            id: `live-${courseId}-tomorrow`,
            courseId: courseId,
            courseTitle: course.title,
            meetLink: course.meetLink || 'https://meet.google.com/xyz-uvwx-123',
            scheduledTime: tomorrowClass.toISOString(),
            description: `Tomorrow's live session for ${course.title}`,
            isActive: false,
            attendees: 0
          });
        }
      } catch (error) {
        console.error(`Error processing course ${courseId}:`, error);
      }
    }

    res.json({
      success: true,
      data: {
        liveClasses: liveClasses.sort((a, b) => 
          new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
        )
      }
    });

  } catch (error) {
    console.error('Live classes fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
