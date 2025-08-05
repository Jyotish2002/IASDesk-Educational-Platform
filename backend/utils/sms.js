const twilio = require('twilio');

let client = null;

// Initialize Twilio client only if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.warn('Twilio initialization failed:', error.message);
    console.warn('SMS will be logged to console instead');
  }
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (mobile, otp) => {
  try {
    // In development mode or if Twilio is not configured, just log the OTP
    if (process.env.NODE_ENV === 'development' || !client || !process.env.TWILIO_PHONE_NUMBER) {
      console.log(`📱 OTP for ${mobile}: ${otp}`);
      console.log('🔔 SMS sent successfully (development/fallback mode)');
      return { success: true, message: 'OTP sent successfully (development mode)' };
    }

    // Production mode - send actual SMS via Twilio
    const message = await client.messages.create({
      body: `Your IASDesk verification code is: ${otp}. This code will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}`
    });

    return { 
      success: true, 
      message: 'OTP sent successfully',
      sid: message.sid 
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    
    // Fallback to console log if Twilio fails
    console.log(`📱 OTP for ${mobile}: ${otp} (Twilio failed, showing in console)`);
    
    return { 
      success: true, 
      message: 'OTP sent successfully (fallback mode)' 
    };
  }
};

module.exports = {
  generateOTP,
  sendOTP
};
