const { generateOTP, sendOTP } = require('./utils/sms');

async function testSMS() {
  console.log('🧪 Testing Fast2SMS Integration...\n');
  
  // Test OTP generation
  const otp = generateOTP();
  console.log('Generated OTP:', otp);
  console.log('OTP Length:', otp.length);
  console.log('Is 6-digit number:', /^\d{6}$/.test(otp));
  
  // Test SMS sending (will use development mode)
  const testMobile = '9876543210';
  console.log(`\n📱 Testing SMS to: ${testMobile}`);
  
  try {
    const result = await sendOTP(testMobile, otp);
    console.log('SMS Result:', result);
    
    if (result.success) {
      console.log('✅ SMS test completed successfully!');
    } else {
      console.log('❌ SMS test failed');
    }
  } catch (error) {
    console.error('❌ SMS test error:', error);
  }
  
  console.log('\n📋 Environment Check:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('FAST2SMS_API_KEY:', process.env.FAST2SMS_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('FAST2SMS_SENDER_ID:', process.env.FAST2SMS_SENDER_ID || 'Using default: IASDESK');
}

// Run test if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  testSMS();
}

module.exports = { testSMS };
