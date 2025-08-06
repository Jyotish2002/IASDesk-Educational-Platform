import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authAPI } from '../services/api';
import { tokenUtils } from '../utils/token';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (userData?: User) => void;
  loginWithMobile: (mobile: string) => Promise<boolean>;
  sendOTP: (mobile: string) => Promise<boolean>;
  verifyOTP: (mobile: string, otp: string) => Promise<boolean>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenUtils.getToken();
      const userStr = tokenUtils.getStoredUser();

      if (token && userStr) {
        try {
          // Simply restore the authentication state from localStorage
          // The JWT tokens are verified on each API request by the backend
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: userStr, token },
          });
          
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid stored data
          tokenUtils.clearTokens();
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    checkAuth();
  }, []);

  const sendOTP = async (mobile: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authAPI.sendOTP({ mobile });
      
      if (response.data.success) {
        toast.success(response.data.message);
        dispatch({ type: 'AUTH_FAILURE' }); // Reset loading state
        return true;
      } else {
        toast.error(response.data.message);
        dispatch({ type: 'AUTH_FAILURE' });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  const verifyOTP = async (mobile: string, otp: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authAPI.verifyOTP({ mobile, otp });
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Store in localStorage
        tokenUtils.setToken(token);
        tokenUtils.setStoredUser(user);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        
        toast.success(response.data.message);
        return true;
      } else {
        toast.error(response.data.message);
        dispatch({ type: 'AUTH_FAILURE' });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  const login = (userData?: User): void => {
    if (userData) {
      // Direct login with user data (for teacher login)
      const token = tokenUtils.getToken();
      if (token) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: userData, token },
        });
      }
    }
  };

  // Keep the original mobile-based login for backward compatibility
  const loginWithMobile = async (mobile: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authAPI.login({ mobile });
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Store tokens using tokenUtils
        tokenUtils.setToken(token);
        tokenUtils.setStoredUser(user);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        
        toast.success(response.data.message);
        return true;
      } else {
        toast.error(response.data.message);
        dispatch({ type: 'AUTH_FAILURE' });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Make API call to backend for admin authentication
      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: username, // username is actually mobile number
          password: password
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const { user, token } = data.data;

        // Store admin session in localStorage (for compatibility with existing code)
        tokenUtils.setAdminToken(token);
        tokenUtils.setStoredUser(user);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });

        toast.success(`Welcome ${user.name}! Admin access granted.`);
        return true;
      } else {
        toast.error(data.message || 'Invalid admin credentials');
        dispatch({ type: 'AUTH_FAILURE' });
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Failed to login. Please check your connection and try again.');
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    tokenUtils.clearTokens();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.data.success && response.data.data) {
        const updatedUser = response.data.data.user;
        
        // Update localStorage
        tokenUtils.setStoredUser(updatedUser);
        
        dispatch({
          type: 'UPDATE_USER',
          payload: updatedUser,
        });
        
        toast.success(response.data.message);
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    loginWithMobile,
    sendOTP,
    verifyOTP,
    adminLogin,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
