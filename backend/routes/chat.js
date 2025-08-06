const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (for Cloudinary)
const memoryStorage = multer.memoryStorage();
const cloudinaryUpload = multer({ 
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/chat-images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   GET /api/chat/messages/:receiverId
// @desc    Get messages between current user and receiver
// @access  Private
router.get('/messages/:receiverId', auth, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const userId = req.user.id;

    // Find messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    })
    .populate('senderId', 'name email role')
    .sort({ timestamp: 1 })
    .limit(100); // Limit to last 100 messages

    // Mark messages as read where current user is receiver
    await Message.updateMany(
      { 
        senderId: receiverId, 
        receiverId: userId, 
        isRead: false 
      },
      { isRead: true }
    );

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      _id: message._id,
      senderId: message.senderId._id,
      receiverId: message.receiverId,
      message: message.message,
      image: message.image, // Keep Cloudinary URL as is, or local path for backward compatibility
      timestamp: message.timestamp,
      isRead: message.isRead,
      senderName: message.senderId.name,
      senderRole: message.senderId.role
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

// @route   POST /api/chat/send-message
// @desc    Send a message to another user
// @access  Private
router.post('/send-message', auth, async (req, res) => {
  try {
    const { receiverId, message, image } = req.body;
    const senderId = req.user.id;

    // Validate that receiver exists and is a teacher (if sender is student) or student (if sender is teacher)
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if it's a valid teacher-student communication
    if (sender.role === 'student' && receiver.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Students can only message teachers'
      });
    }

    if (sender.role === 'teacher' && receiver.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Teachers can only message students'
      });
    }

    // Validate message content
    if (!message && !image) {
      return res.status(400).json({
        success: false,
        message: 'Message content or image is required'
      });
    }

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message || '',
      image: image || null,
      timestamp: new Date(),
      isRead: false
    });

    await newMessage.save();

    // Populate sender info for response
    await newMessage.populate('senderId', 'name email role');

    res.status(201).json({
      success: true,
      data: {
        message: {
          _id: newMessage._id,
          senderId: newMessage.senderId._id,
          receiverId: newMessage.receiverId,
          message: newMessage.message,
          image: newMessage.image,
          timestamp: newMessage.timestamp,
          isRead: newMessage.isRead,
          senderName: newMessage.senderId.name,
          senderRole: newMessage.senderId.role
        }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   POST /api/chat/upload-image-cloudinary
// @desc    Upload image to Cloudinary for chat
// @access  Private
router.post('/upload-image-cloudinary', auth, cloudinaryUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const uploadOptions = {
      folder: 'iasdesk-chat-images',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    };

    // Convert buffer to base64 for Cloudinary upload
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const uploadResult = await cloudinary.uploader.upload(fileStr, uploadOptions);

    res.json({
      success: true,
      data: {
        cloudinaryUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
      }
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image to Cloudinary'
    });
  }
});

// @route   POST /api/chat/upload-image
// @desc    Upload image for chat
// @access  Private
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/chat-images/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
});

// @route   GET /api/chat/unread-count
// @desc    Get count of unread messages for current user
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Count unread messages where current user is receiver
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting unread count'
    });
  }
});

module.exports = router;
