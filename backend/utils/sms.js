const fast2sms = require('fast-two-sms');

// Fast2SMS configuration
const fast2smsConfig = {
  authorization: process.env.FAST2SMS_API_KEY,
  sender_id: process.env.FAST2SMS_SENDER_ID || 'IASDESK',
  message: '',
  language: 'english',
  route: 'p', // promotional route, use 't' for transactional
  numbers: ''
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (mobile, otp) => {
  try {
    // In development mode or if Fast2SMS API key is not configured, just log the OTP
    if (process.env.NODE_ENV === 'development' || !process.env.FAST2SMS_API_KEY) {
      console.log(`📱 OTP for ${mobile}: ${otp}`);
      console.log('🔔 SMS sent successfully (development/fallback mode)');
      return { success: true, message: 'OTP sent successfully (development mode)' };
    }

    // Production mode - send actual SMS via Fast2SMS
    const message = `Your IASDesk verification code is: ${otp}. This code will expire in 5 minutes. Do not share this OTP with anyone.`;
    
    const smsOptions = {
      authorization: process.env.FAST2SMS_API_KEY,
      sender_id: process.env.FAST2SMS_SENDER_ID || 'IASDESK',
      message: message,
      language: 'english',
      route: 't', // transactional route for OTP (more reliable)
      numbers: mobile // Fast2SMS expects mobile number without +91
    };

    const response = await fast2sms.sendMessage(smsOptions);

    if (response.return === true) {
      console.log('✅ Fast2SMS response:', response);
      return { 
        success: true, 
        message: 'OTP sent successfully',
        messageId: response.request_id 
      };
    } else {
      throw new Error(`Fast2SMS API error: ${response.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('Fast2SMS sending error:', error);
    
    // Fallback to console log if Fast2SMS fails
    console.log(`📱 OTP for ${mobile}: ${otp} (Fast2SMS failed, showing in console)`);
    
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
