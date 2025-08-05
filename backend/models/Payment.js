const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe'],
    required: true
  },
  paymentId: {
    type: String,
    required: false // Will be set after successful payment
  },
  orderId: {
    type: String,
    required: true
  },
  signature: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Create indexes
paymentSchema.index({ userId: 1 });
paymentSchema.index({ courseId: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
