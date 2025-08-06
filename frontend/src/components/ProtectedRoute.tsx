import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenUtils } from '../utils/token';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireTeacher?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requireTeacher = false 
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          setIsAuthorized(false);
          setIsVerifying(false);
          return;
        }

        // For admin routes, verify admin token with backend
        if (requireAdmin) {
          const adminToken = tokenUtils.getAdminToken();
          
          if (!adminToken) {
            toast.error('Admin authentication required');
            setIsAuthorized(false);
            setIsVerifying(false);
            return;
          }

          // Verify admin token with backend
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-admin`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
              }
            });

            const data = await response.json();

            if (data.success && data.data?.isAdmin) {
              // Additional check: ensure user has admin role
              if (user.role === 'admin' || user.isAdmin) {
                setIsAuthorized(true);
              } else {
                console.log('Admin role check failed:', { userRole: user.role, isAdmin: user.isAdmin });
                toast.error('Insufficient privileges. Admin access required.');
                setIsAuthorized(false);
                // Don't logout immediately, just deny access
              }
            } else {
              console.log('Admin verification failed:', data);
              toast.error('Invalid or expired admin session. Please login again.');
              setIsAuthorized(false);
              // Clear invalid admin tokens
              tokenUtils.clearAdminToken();
              logout();
            }
          } catch (error) {
            console.error('Admin verification failed:', error);
            toast.error('Failed to verify admin credentials');
            setIsAuthorized(false);
            // Don't logout on network errors, just deny access
            tokenUtils.clearAdminToken();
          }
        }
        // For teacher routes, verify teacher role
        else if (requireTeacher) {
          if (user.role === 'teacher') {
            const token = tokenUtils.getToken();
            
            if (!token) {
              toast.error('Teacher authentication required');
              setIsAuthorized(false);
              setIsVerifying(false);
              return;
            }

            // Verify teacher token with backend
            try {
              const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-teacher`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });

              const data = await response.json();

              if (data.success && data.data?.isTeacher) {
                setIsAuthorized(true);
              } else {
                toast.error('Invalid teacher session. Please login again.');
                setIsAuthorized(false);
                logout();
              }
            } catch (error) {
              console.error('Teacher verification failed:', error);
              toast.error('Failed to verify teacher credentials');
              setIsAuthorized(false);
              logout();
            }
          } else {
            toast.error('Teacher access required');
            setIsAuthorized(false);
          }
        }
        // For regular authenticated routes
        else {
          const token = tokenUtils.getToken();
          
          if (token && user) {
            // Basic token verification (can be enhanced with backend verification)
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        }
      } catch (error) {
        console.error('Access verification error:', error);
        setIsAuthorized(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [isAuthenticated, user, requireAdmin, requireTeacher, logout]);

  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    if (requireAdmin) {
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    } else if (requireTeacher) {
      return <Navigate to="/teacher-login" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
