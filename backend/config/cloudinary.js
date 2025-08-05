const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection test:', result.status === 'ok' ? '✓ Connected' : '✗ Failed');
  } catch (error) {
    console.error('Cloudinary connection test failed:', error.message);
  }
};

// Run the test
testCloudinaryConnection();

// Debug logging for Cloudinary config
console.log('Cloudinary Configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing'
});

// Create storage for course images
const courseImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'iasdesk/courses',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 450, crop: 'fill' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      // Simplify the public_id to avoid special characters
      return `course-${timestamp}`;
    }
  },
});

// Create storage for user profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'iasdesk/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', quality: 'auto', radius: 'max' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const userId = req.user?.id || 'anonymous';
      return `profile-${userId}-${timestamp}`;
    }
  },
});

// Create storage for current affairs images
const currentAffairsImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'iasdesk/current-affairs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 600, height: 400, crop: 'fill', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `current-affair-${originalName}-${timestamp}`;
    }
  },
});

// Create multer instances for different upload types
const uploadCourseImage = multer({
  storage: courseImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadCurrentAffairsImage = multer({
  storage: currentAffairsImageStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to delete images from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    fetch_format: 'auto'
  });
};

module.exports = {
  cloudinary,
  uploadCourseImage,
  uploadProfileImage,
  uploadCurrentAffairsImage,
  deleteImage,
  getOptimizedImageUrl
};
