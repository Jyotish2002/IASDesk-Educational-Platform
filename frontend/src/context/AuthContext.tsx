import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { User, AuthState } from '../types';
import { authAPI } from '../services/api';
import { tokenUtils } from '../utils/token';
import { sessionUtils } from '../utils/session';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (userData?: User) => void;
  loginWithMobile: (mobile: string) => Promise<boolean>;
  sendOTP: (mobile: string) => Promise<boolean>;
  verifyOTP: (mobile: string, otp: string) => Promise<boolean>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isAdmin: boolean;
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
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for stored token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenUtils.getToken();
      const userStr = tokenUtils.getStoredUser();

      if (token && userStr) {
        try {
          // For admin users, skip backend verification on app load to prevent logout
          // The ProtectedRoute will handle verification when accessing admin routes
          if (userStr.isAdmin || userStr.role === 'admin') {
            // Restore admin session without backend verification
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: userStr, token },
            });
            return;
          }

          // For regular users, verify token with backend
          const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.user) {
              // Use fresh user data from backend
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: data.data.user, token },
              });
            } else {
              // Invalid token, clear stored data
              console.log('Token verification failed:', data.message);
              tokenUtils.clearTokens();
              dispatch({ type: 'AUTH_FAILURE' });
            }
          } else {
            // Token verification failed, but don't immediately logout for network issues
            console.log('Token verification network error, using stored data');
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: userStr, token },
            });
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // On network error, restore from localStorage to prevent unnecessary logout
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: userStr, token },
          });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    checkAuth();

    // Check if user is admin
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
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
        
        // Handle session conflict
        sessionUtils.handleSessionConflict(user.id);
        sessionUtils.setActiveSession(user.id);
        
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
        
        // Handle session conflict
        sessionUtils.handleSessionConflict(user.id);
        sessionUtils.setActiveSession(user.id);
        
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/admin/login`, {
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

        // For admin users, handle session differently
        if (user.isAdmin || user.role === 'admin') {
          // Clear any existing sessions for admin
          sessionUtils.clearSession();
          
          // Set new admin session
          sessionUtils.setActiveSession(user.id);
        } else {
          // Handle session conflict for regular users
          sessionUtils.handleSessionConflict(user.id);
          sessionUtils.setActiveSession(user.id);
        }

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
    sessionUtils.clearSession();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.data.success && response.data.data) {
        const updatedUser = response.data.data.user;
        
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
    isAdmin,
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
