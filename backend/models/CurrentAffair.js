const mongoose = require('mongoose');

const currentAffairSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'National', 
      'International', 
      'Economics', 
      'Politics', 
      'Environment', 
      'Science & Technology', 
      'Defense', 
      'Sports', 
      'Awards & Honors', 
      'Government Schemes',
      // Legacy categories for backward compatibility
      'Economy', 
      'Science', 
      'Defence', 
      'General'
    ]
  },
  tags: [String],
  imageURL: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true
  },
  meetLink: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  importance: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
currentAffairSchema.index({ title: 'text', content: 'text' });
currentAffairSchema.index({ category: 1 });
currentAffairSchema.index({ datePosted: -1 });
currentAffairSchema.index({ isActive: 1 });

module.exports = mongoose.model('CurrentAffair', currentAffairSchema);