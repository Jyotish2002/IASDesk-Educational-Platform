const express = require('express');
const { 
  uploadCourseImage, 
  uploadProfileImage, 
  uploadCurrentAffairsImage,
  deleteImage 
} = require('../config/cloudinary');
const { adminAuth } = require('../middleware/adminAuth');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Upload course image (Admin only)
router.post('/course', adminAuth, uploadCourseImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course image uploaded successfully',
      data: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Course image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload course image',
      error: error.message
    });
  }
});

// Upload profile image (Authenticated users)
router.post('/profile', auth, uploadProfileImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
});

// Upload current affairs image (Admin only)
router.post('/current-affairs', adminAuth, uploadCurrentAffairsImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Current affairs image uploaded successfully',
      data: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Current affairs image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload current affairs image',
      error: error.message
    });
  }
});

// Delete image (Admin only)
router.delete('/:publicId', adminAuth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Replace URL-encoded slashes back to normal slashes
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteImage(decodedPublicId);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

// Get upload signed URL (for direct client uploads - optional advanced feature)
router.get('/signature/:uploadType', adminAuth, async (req, res) => {
  try {
    const { uploadType } = req.params;
    const { cloudinary } = require('../config/cloudinary');
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    let folder;
    switch (uploadType) {
      case 'course':
        folder = 'iasdesk/courses';
        break;
      case 'profile':
        folder = 'iasdesk/profiles';
        break;
      case 'current-affairs':
        folder = 'iasdesk/current-affairs';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid upload type'
        });
    }
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        quality: 'auto',
        fetch_format: 'auto'
      },
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder
      }
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature',
      error: error.message
    });
  }
});

module.exports = router;
