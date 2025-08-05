const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: { expireAfterSeconds: 300 } // 5 minutes
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create index for mobile number
otpSchema.index({ mobile: 1 });

module.exports = mongoose.model('OTP', otpSchema);
