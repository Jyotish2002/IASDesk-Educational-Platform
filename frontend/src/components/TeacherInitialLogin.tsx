import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, LogIn, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { tokenUtils } from '../utils/token';

const TeacherInitialLogin: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
        toast.error('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }

      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/teachers/initial-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobile })
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        tokenUtils.setToken(result.data.token);
        tokenUtils.setStoredUser(result.data.user);

        // Update auth context
        login(result.data.user);

        toast.success(result.message);
        
        // Redirect to profile completion
        navigate('/teacher/complete-profile');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-primary-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Teacher Login</h2>
          <p className="mt-2 text-gray-600">
            Enter your mobile number to access your account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="mobile"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobile(value);
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-lg"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Use the mobile number provided by admin
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
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">First Time Login:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enter your mobile number (no password needed)</li>
                <li>• Complete your profile with name and password</li>
                <li>• Use mobile + password for future logins</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/teacher-login')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Already set up your profile? Login with password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherInitialLogin;
