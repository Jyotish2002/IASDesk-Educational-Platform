import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (mobile: string) => Promise<boolean>;
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
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          // For admin tokens, skip backend verification
          if (token.startsWith('admin-token-')) {
            const user = JSON.parse(userStr);
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token },
            });
            return;
          }

          // Verify regular token with backend
          const response = await authAPI.getProfile();
          if (response.data.success) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data.data!.user, token },
            });
            return;
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      dispatch({ type: 'AUTH_FAILURE' });
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
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
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

  const login = async (mobile: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authAPI.login({ mobile });
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
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

      // Simple admin credentials
      const adminCredentials = [
        { username: 'admin', password: 'admin123', name: 'Admin', id: 'admin1' },
        { username: 'iasdesk', password: 'iasdesk2025', name: 'IASDesk Admin', id: 'admin2' }
      ];

      const admin = adminCredentials.find(
        cred => cred.username === username && cred.password === password
      );

      if (admin) {
        // Create admin user object
        const adminUser: User = {
          id: admin.id,
          name: admin.name,
          mobile: '9999999999',
          email: `${admin.username}@iasdesk.com`,
          isVerified: true,
          isAdmin: true,
          enrolledCourses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const token = 'admin-token-' + admin.id;

        // Store admin session
        localStorage.setItem('authToken', token);
        localStorage.setItem('adminToken', 'admin-authenticated');
        localStorage.setItem('user', JSON.stringify(adminUser));

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: adminUser, token },
        });

        toast.success(`Welcome ${admin.name}! Admin access granted.`);
        return true;
      } else {
        toast.error('Invalid admin credentials');
        dispatch({ type: 'AUTH_FAILURE' });
        return false;
      }
    } catch (error) {
      toast.error('Admin login failed');
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.data.success && response.data.data) {
        const updatedUser = response.data.data.user;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
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
