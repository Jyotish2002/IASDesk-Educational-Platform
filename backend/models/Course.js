const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageURL: {
    type: String,
    required: true,
    trim: true
  },
  imagePublicId: {
    type: String,
    trim: true // Cloudinary public ID for image management
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  features: [String],
  curriculum: [{
    title: String,
    topics: [String]
  }],
  instructor: {
    name: String,
    bio: String,
    image: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Google Meet Session Fields
  meetLink: {
    type: String,
    trim: true
  },
  meetSchedule: {
    dailyTime: {
      type: String, // Format: "10:30 AM"
      trim: true
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  liveSessions: [{
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    meetLink: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for admin-created courses
  }
}, {
  timestamps: true
});

// Create indexes
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ isActive: 1 });

module.exports = mongoose.model('Course', courseSchema);
