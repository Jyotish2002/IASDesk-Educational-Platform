const express = require('express');
const router = express.Router();
const CurrentAffair = require('../models/CurrentAffair');
const { simpleAdminAuth } = require('../middleware/simpleAdminAuth');

// @route   GET /api/current-affairs
// @desc    Get all current affairs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      sortBy = 'datePosted',
      sortOrder = 'desc',
      importance,
      fromDate,
      toDate
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (importance) {
      query.importance = importance;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (fromDate || toDate) {
      query.datePosted = {};
      if (fromDate) query.datePosted.$gte = new Date(fromDate);
      if (toDate) query.datePosted.$lte = new Date(toDate);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const currentAffairs = await CurrentAffair.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name')
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
    console.error('Get current affairs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/current-affairs/categories
// @desc    Get all current affairs categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await CurrentAffair.distinct('category', { isActive: true });
    
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

// @route   GET /api/current-affairs/recent
// @desc    Get recent current affairs
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const recentAffairs = await CurrentAffair.find({ 
      isActive: true 
    })
    .sort({ datePosted: -1 })
    .limit(parseInt(limit))
    .populate('createdBy', 'name')
    .select('-__v');

    res.json({
      success: true,
      data: { currentAffairs: recentAffairs }
    });
  } catch (error) {
    console.error('Get recent current affairs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/current-affairs/:id
// @desc    Get single current affair
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const currentAffair = await CurrentAffair.findOne({ 
      _id: req.params.id, 
      isActive: true 
    })
    .populate('createdBy', 'name')
    .select('-__v');

    if (!currentAffair) {
      return res.status(404).json({
        success: false,
        message: 'Current affair not found'
      });
    }

    res.json({
      success: true,
      data: { currentAffair }
    });
  } catch (error) {
    console.error('Get current affair error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/current-affairs
// @desc    Create new current affair
// @access  Admin only
router.post('/', simpleAdminAuth, async (req, res) => {
  try {
    console.log('Creating current affair with data:', req.body);
    
    const {
      title,
      content,
      category,
      importance,
      tags,
      source,
      meetLink,
      scheduledDate
    } = req.body;

    // Validation
    if (!title || !content || !category) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required',
        data: null
      });
    }

    // Validate title length
    if (title.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 5 characters long',
        data: null
      });
    }

    // Validate content length
    if (content.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 20 characters long',
        data: null
      });
    }

    console.log('Creating current affair for user:', req.user.id);

    const currentAffair = new CurrentAffair({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      importance: importance ? importance.charAt(0).toUpperCase() + importance.slice(1).toLowerCase() : 'Medium',
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
      source: source ? source.trim() : '',
      meetLink: meetLink ? meetLink.trim() : '',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      createdBy: req.user.id,
      datePosted: new Date(),
      isActive: true
    });

    const savedAffair = await currentAffair.save();
    console.log('Current affair saved successfully:', savedAffair._id);
    
    res.status(201).json({
      success: true,
      message: 'Current affair created successfully',
      data: { currentAffair: savedAffair }
    });
  } catch (error) {
    console.error('Create current affair error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + validationErrors.join(', '),
        data: null
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A current affair with this title already exists',
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      data: null
    });
  }
});

// @route   PUT /api/current-affairs/:id
// @desc    Update current affair
// @access  Admin only
router.put('/:id', simpleAdminAuth, async (req, res) => {
  try {
    console.log('Updating current affair:', req.params.id);
    console.log('Update data:', req.body);

    const {
      title,
      content,
      category,
      importance,
      tags,
      source,
      meetLink,
      scheduledDate,
      isActive
    } = req.body;

    const currentAffair = await CurrentAffair.findById(req.params.id);

    if (!currentAffair) {
      return res.status(404).json({
        success: false,
        message: 'Current affair not found',
        data: null
      });
    }

    // Update fields
    if (title) currentAffair.title = title.trim();
    if (content) currentAffair.content = content.trim();
    if (category) currentAffair.category = category.trim();
    if (importance) currentAffair.importance = importance.charAt(0).toUpperCase() + importance.slice(1).toLowerCase();
    if (tags) currentAffair.tags = Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [];
    if (source !== undefined) currentAffair.source = source ? source.trim() : '';
    if (meetLink !== undefined) currentAffair.meetLink = meetLink ? meetLink.trim() : '';
    if (scheduledDate !== undefined) currentAffair.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    if (typeof isActive !== 'undefined') currentAffair.isActive = isActive;
    
    currentAffair.updatedAt = new Date();

    const updatedAffair = await currentAffair.save();
    console.log('Current affair updated successfully:', updatedAffair._id);

    res.json({
      success: true,
      message: 'Current affair updated successfully',
      data: { currentAffair: updatedAffair }
    });
  } catch (error) {
    console.error('Update current affair error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + validationErrors.join(', '),
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      data: null
    });
  }
});

// @route   DELETE /api/current-affairs/:id
// @desc    Delete current affair
// @access  Admin only
router.delete('/:id', simpleAdminAuth, async (req, res) => {
  try {
    console.log('Deleting current affair:', req.params.id);

    const currentAffair = await CurrentAffair.findById(req.params.id);

    if (!currentAffair) {
      return res.status(404).json({
        success: false,
        message: 'Current affair not found',
        data: null
      });
    }

    // Soft delete by setting isActive to false
    currentAffair.isActive = false;
    currentAffair.updatedAt = new Date();
    await currentAffair.save();

    console.log('Current affair deleted successfully:', req.params.id);

    res.json({
      success: true,
      message: 'Current affair deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete current affair error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      data: null
    });
  }
});

module.exports = router;
