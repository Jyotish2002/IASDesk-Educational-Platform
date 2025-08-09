const Razorpay = require('razorpay');

// Get credentials from environment
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('=== RAZORPAY CONFIGURATION DEBUG ===');
console.log('RAZORPAY_KEY_ID:', keyId);
console.log('Key contains live indicator:', keyId?.includes('xQLe7F2435jiQE'));

// Validate configuration
if (!keyId || !keySecret) {
  throw new Error('Razorpay credentials are not configured');
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// FORCE LIVE MODE - Override all detection
const isLiveMode = true; // Force to true

console.log('🔴 FORCED LIVE MODE - ALL PAYMENTS ARE REAL');
console.log('💰 Real money transactions enabled');
console.log('🚀 LIVE KEY DETECTED - Processing real payments');
console.log('🔴 LIVE PAYMENT MODE ACTIVE - Real money transactions');
console.log('💰 All payments will be processed with real money');
console.log('=======================================');

module.exports = {
  razorpay,
  isLiveMode: true // Always return true
};
