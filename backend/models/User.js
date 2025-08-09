const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  password: {
    type: String,
    trim: true
  },
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isProfileComplete: {
    type: Boolean,
    default: true // Default true for students, will be false for new teachers
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    paymentId: String
  }],
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  // Teacher specific fields
  subject: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  profileImage: {
    type: String
  },
  specialization: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    trim: true,
    maxLength: 500
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);