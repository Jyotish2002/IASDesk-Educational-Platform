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
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Politics', 'Economy', 'International', 'Science', 'Sports', 'Environment', 'Defence', 'General']
  },
  tags: [String],
  imageURL: {
    type: String,
    trim: true
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
