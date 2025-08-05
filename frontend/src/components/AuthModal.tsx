import React, { useState } from 'react';
import { X, Phone, Shield, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

type AuthStep = 'choose' | 'login' | 'register' | 'verify-otp';

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Authentication Required",
  subtitle = "Please login or register to continue"
}) => {
  const { login, sendOTP, verifyOTP, loading } = useAuth();
  const [step, setStep] = useState<AuthStep>('choose');
  const [mobile, setMobile] = useState('');
  const [otp, setOTP] = useState('');

  const resetForm = () => {
    setStep('choose');
    setMobile('');
    setOTP('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const success = await login(mobile);
    if (success) {
      handleClose();
      onSuccess?.();
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const success = await sendOTP(mobile);
    if (success) {
      setStep('verify-otp');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    const success = await verifyOTP(mobile, otp);
    if (success) {
      handleClose();
      onSuccess?.();
    }
  };

  const handleBackToChoose = () => {
    setStep('choose');
    setMobile('');
    setOTP('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {/* Step: Choose Auth Method */}
        {step === 'choose' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('login')}
              className="w-full border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                  <LogIn className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Login</h3>
                  <p className="text-sm text-gray-600">Already have an account? Login with your mobile number</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setStep('register')}
              className="w-full border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-4 group-hover:bg-green-200 transition-colors">
                  <UserPlus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Register</h3>
                  <p className="text-sm text-gray-600">New user? Create an account with OTP verification</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step: Login */}
        {step === 'login' && (
          <div>
            <button
              onClick={handleBackToChoose}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to options
            </button>

            <div className="text-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full inline-block mb-3">
                <LogIn className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Login to Your Account</h3>
              <p className="text-sm text-gray-600">Enter your registered mobile number</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !mobile || mobile.length !== 10}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep('register')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Don't have an account? Register here
              </button>
            </div>
          </div>
        )}

        {/* Step: Register */}
        {step === 'register' && (
          <div>
            <button
              onClick={handleBackToChoose}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to options
            </button>

            <div className="text-center mb-6">
              <div className="bg-green-100 p-3 rounded-full inline-block mb-3">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Account</h3>
              <p className="text-sm text-gray-600">We'll send an OTP to verify your mobile number</p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !mobile || mobile.length !== 10}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep('login')}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Already have an account? Login here
              </button>
            </div>
          </div>
        )}

        {/* Step: Verify OTP */}
        {step === 'verify-otp' && (
          <div>
            <button
              onClick={() => setStep('register')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to mobile number
            </button>

            <div className="text-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full inline-block mb-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify OTP</h3>
              <p className="text-sm text-gray-600">
                We've sent a 6-digit OTP to <strong>+91 {mobile}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !otp || otp.length !== 6}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
              >
                Didn't receive OTP? Resend
              </button>
            </div>
          </div>
        )}

        {/* Demo Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-xs text-center">
            🚀 <strong>Demo Mode:</strong> Use any 10-digit number. OTP: 123456
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
