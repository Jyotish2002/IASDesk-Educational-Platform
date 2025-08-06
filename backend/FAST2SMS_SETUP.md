# Fast2SMS Integration Setup

This project has been updated to use Fast2SMS for OTP services instead of Twilio. Fast2SMS is a popular Indian SMS service provider with competitive pricing and good delivery rates.

## Getting Started with Fast2SMS

### 1. Create Fast2SMS Account
1. Visit [Fast2SMS](https://www.fast2sms.com/)
2. Sign up for a new account
3. Complete the verification process
4. Add credits to your account

### 2. Get API Credentials
1. Login to your Fast2SMS dashboard
2. Go to "Developer API" section
3. Copy your API Key
4. Note down your Sender ID (default: FSTSMS, you can create custom ones)

### 3. Configure Environment Variables
Add these variables to your `.env` file:

```bash
# Fast2SMS Configuration
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_SENDER_ID=IASDESK
```

### 4. API Features Used
- **Route**: Transactional (for OTP messages)
- **Language**: English
- **Format**: Plain text
- **Numbers**: Indian mobile numbers (10 digits without +91)

## Fast2SMS vs Twilio Comparison

| Feature | Fast2SMS | Twilio |
|---------|----------|--------|
| **Pricing** | ₹0.15-0.25 per SMS | $0.0075 per SMS (~₹0.60) |
| **Indian Focus** | ✅ Optimized for India | ❌ Global service |
| **DLT Registration** | ✅ Built-in support | ❌ Manual process |
| **Setup Complexity** | ✅ Simple | ❌ Complex for India |
| **Delivery Speed** | ✅ Fast in India | ⚠️ Variable |

## Environment Modes

### Development Mode
- OTP is logged to console
- No actual SMS sent
- Set `NODE_ENV=development`

### Production Mode
- Actual SMS sent via Fast2SMS
- Requires valid API key
- Set `NODE_ENV=production`

## Error Handling
- If Fast2SMS fails, system falls back to console logging
- Detailed error logs for debugging
- Graceful degradation ensures app continues working

## Message Format
```
Your IASDesk verification code is: {OTP}. This code will expire in 5 minutes. Do not share this OTP with anyone.
```

## Testing
1. Set development mode to test without sending SMS
2. Check console logs for OTP values
3. Use production mode with small credit balance for testing

## Migration from Twilio
- Old Twilio configuration is preserved but unused
- Can be safely removed from environment variables
- No code changes needed - same function signatures

## Support
- Fast2SMS Documentation: https://www.fast2sms.com/docs
- Support: Contact Fast2SMS support team
- Pricing: Check current rates on Fast2SMS website
