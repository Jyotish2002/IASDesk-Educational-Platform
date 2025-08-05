import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateMobile, validateOTP } from '../utils/helpers';
import toast from 'react-hot-toast';

type AuthStep = 'mobile' | 'otp' | 'login';

const Auth: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const { sendOTP, verifyOTP, login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateMobile(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // First try to login (for existing users)
    const loginSuccess = await login(mobile);
    
    if (loginSuccess) {
      // User exists and logged in successfully
      return;
    }

    // If login fails, it means user doesn't exist, so send OTP for registration
    const otpSent = await sendOTP(mobile);
    
    if (otpSent) {
      setStep('otp');
      setResendTimer(60); // 60 seconds cooldown
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOTP(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    const success = await verifyOTP(mobile, otp);
    
    if (success) {
      // User will be redirected by the useEffect above
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    const otpSent = await sendOTP(mobile);
    
    if (otpSent) {
      setResendTimer(60);
      toast.success('OTP sent again');
    }
  };

  const formatMobile = (value: string) => {
    // Remove non-digits and limit to 10 digits
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setMobile(digits);
  };

  const formatOTP = (value: string) => {
    // Remove non-digits and limit to 6 digits
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-primary-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            {step === 'mobile' ? <Phone className="h-8 w-8" /> : <Shield className="h-8 w-8" />}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 'mobile' ? 'Welcome to IASDesk' : 'Verify Your Number'}
          </h2>
          <p className="mt-2 text-gray-600">
            {step === 'mobile' 
              ? 'Enter your mobile number to get started' 
              : `We've sent a 6-digit code to ${mobile}`
            }
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {step === 'mobile' && (
            <form onSubmit={handleMobileSubmit} className="space-y-6">
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    id="mobile"
                    value={mobile}
                    onChange={(e) => formatMobile(e.target.value)}
                    className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-lg"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  We'll send you an OTP for verification
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => formatOTP(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-lg text-center tracking-wider"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter the 6-digit code sent to +91 {mobile}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    Verify & Continue
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('mobile');
                    setOtp('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Change mobile number
                </button>
                
                <div>
                  {resendTimer > 0 ? (
                    <span className="text-sm text-gray-500">
                      Resend OTP in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Benefits section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              What you get with IASDesk:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Access to premium courses and study materials
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Daily current affairs updates
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Expert guidance and doubt clearing sessions
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Track your progress and performance
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-primary-600 hover:text-primary-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary-600 hover:text-primary-700">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
