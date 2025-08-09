const mongoose = require('mongoose');

const googleMeetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  meetLink: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['live-session', 'daily-schedule'],
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  assignedTeachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
googleMeetSchema.index({ date: 1, startTime: 1 });
googleMeetSchema.index({ assignedTeachers: 1 });
googleMeetSchema.index({ status: 1 });

// Virtual for formatted date
googleMeetSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for session duration
googleMeetSchema.virtual('duration').get(function() {
  const start = new Date(`2000-01-01 ${this.startTime}`);
  const end = new Date(`2000-01-01 ${this.endTime}`);
  const diff = end - start;
  return Math.round(diff / (1000 * 60)); // Duration in minutes
});

// Method to check if session is active
googleMeetSchema.methods.isActive = function() {
  const now = new Date();
  const sessionDate = new Date(this.date);
  const sessionStart = new Date(`${sessionDate.toDateString()} ${this.startTime}`);
  const sessionEnd = new Date(`${sessionDate.toDateString()} ${this.endTime}`);
  
  return now >= sessionStart && now <= sessionEnd && this.status === 'active';
};

// Method to check if session is upcoming
googleMeetSchema.methods.isUpcoming = function() {
  const now = new Date();
  const sessionDate = new Date(this.date);
  const sessionStart = new Date(`${sessionDate.toDateString()} ${this.startTime}`);
  
  return sessionStart > now && this.status === 'active';
};

// Static method to get sessions for a teacher
googleMeetSchema.statics.getTeacherSessions = function(teacherId) {
  return this.find({
    assignedTeachers: { $in: [teacherId] },
    status: 'active'
  })
  .populate('assignedTeachers', 'name email')
  .sort({ date: 1, startTime: 1 });
};

// Static method to get upcoming sessions
googleMeetSchema.statics.getUpcomingSessions = function(limit = 10) {
  const now = new Date();
  return this.find({
    date: { $gte: now },
    status: 'active'
  })
  .populate('assignedTeachers', 'name email')
  .sort({ date: 1, startTime: 1 })
  .limit(limit);
};

module.exports = mongoose.model('GoogleMeet', googleMeetSchema);