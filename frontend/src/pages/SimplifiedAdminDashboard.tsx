import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  BookOpen, 
  BarChart3,
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  LogOut,
  Plus,
  Video,
  RefreshCw,
  FileText,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateCourseModal from '../components/CreateCourseModal';
import GoogleMeetScheduler from '../components/GoogleMeetScheduler';
import LiveClassManager from '../components/LiveClassManager';
import UserManagement from '../components/UserManagement';
import CourseOverview from '../components/CourseOverview';
import AdminCurrentAffairs from '../components/admin/AdminCurrentAffairs';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'login' | 'payment' | 'course_access';
  description: string;
  timestamp: string;
  user: string;
}

const SimplifiedAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'overview' | 'meet-scheduler' | 'live-classes' | 'users' | 'current-affairs' | 'teachers'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }
      
      // Fetch dashboard stats from admin API
      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/admin/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.stats) {
          // Ensure all required properties exist with fallback values
          const apiStats = data.data.stats;
          setStats({
            totalStudents: apiStats.totalUsers || 0, // Map totalUsers to totalStudents
            totalCourses: apiStats.totalCourses || 0,
            totalRevenue: apiStats.totalRevenue || 0,
            activeUsers: apiStats.totalUsers || 0 // Use totalUsers as activeUsers for now
          });
          
          // Transform recentEnrollments to recentActivity format
          const recentEnrollments = data.data.recentEnrollments || [];
          const transformedActivity = recentEnrollments.map((enrollment: any, index: number) => ({
            id: enrollment._id || index.toString(),
            type: 'payment' as const,
            description: `Payment received for ${enrollment.courseId?.title || 'course'}`,
            timestamp: new Date(enrollment.createdAt).toLocaleString(),
            user: enrollment.userId?.name || enrollment.userId?.mobile || 'Unknown user'
          }));
          
          setRecentActivity(transformedActivity);
          toast.success('Dashboard data loaded successfully!');
        } else {
          throw new Error(data.message || 'Failed to load dashboard data');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data, using fallback');
      
      // Fallback to mock data if backend is not available
      const mockStats: DashboardStats = {
        totalStudents: 15247,
        totalCourses: 42,
        totalRevenue: 2850000,
        activeUsers: 1832
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'enrollment',
          description: 'New enrollment in UPSC Prelims Course',
          timestamp: '2 minutes ago',
          user: 'Priya Sharma'
        },
        {
          id: '2',
          type: 'payment',
          description: 'Payment received for Class 12 Physics',
          timestamp: '15 minutes ago',
          user: 'Rahul Kumar'
        },
        {
          id: '3',
          type: 'login',
          description: 'Student logged in',
          timestamp: '30 minutes ago',
          user: 'Anjali Patel'
        },
        {
          id: '4',
          type: 'course_access',
          description: 'Accessed course content',
          timestamp: '1 hour ago',
          user: 'Vikash Singh'
        },
        {
          id: '5',
          type: 'enrollment',
          description: 'New enrollment in SSC CGL Course',
          timestamp: '2 hours ago',
          user: 'Sneha Gupta'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      setTeachersLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/teachers?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setTeachers(result.data.teachers || []);
      } else {
        toast.error(result.message || 'Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers');
    } finally {
      setTeachersLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load teachers when switching to teachers view
  useEffect(() => {
    if (currentView === 'teachers') {
      loadTeachers();
    }
  }, [currentView]);

  // Note: Authentication and admin role verification is now handled by ProtectedRoute component

  // Handle view switching
  if (currentView === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Course Overview & Analytics</h1>
          </div>
          <CourseOverview />
        </div>
      </div>
    );
  }

  if (currentView === 'meet-scheduler') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Google Meet Scheduler</h1>
          </div>
          <GoogleMeetScheduler />
        </div>
      </div>
    );
  }

  if (currentView === 'live-classes') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Live Class Manager</h1>
          </div>
          <LiveClassManager />
        </div>
      </div>
    );
  }

  if (currentView === 'users') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserManagement onBack={() => setCurrentView('dashboard')} />
        </div>
      </div>
    );
  }

  if (currentView === 'current-affairs') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Dashboard
            </button>
          </div>
          <AdminCurrentAffairs />
        </div>
      </div>
    );
  }

  if (currentView === 'teachers') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-8 w-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
              </div>
              <p className="text-gray-600">
                Create and manage teacher accounts for your educational platform
              </p>
            </div>

            {/* Teacher Creation Form */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary-600" />
                Create New Teacher Account
              </h2>
              
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const mobile = formData.get('mobile') as string;
                
                if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
                  toast.error('Please enter a valid 10-digit mobile number');
                  return;
                }

                // API call to create teacher
                const createTeacher = async () => {
                  try {
                    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
                    
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/create-teacher`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ mobile })
                    });

                    const result = await response.json();

                    if (result.success) {
                      toast.success('Teacher account created successfully!');
                      toast.success(`Teacher can login with mobile: ${mobile}`, { duration: 8000 });
                      (e.target as HTMLFormElement).reset();
                      // Refresh teachers list
                      loadTeachers();
                    } else {
                      toast.error(result.message || 'Failed to create teacher');
                    }
                  } catch (error) {
                    console.error('Error creating teacher:', error);
                    toast.error('Failed to create teacher');
                  }
                };

                createTeacher();
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="tel"
                      name="mobile"
                      required
                      maxLength={10}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter 10-digit mobile number"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        e.target.value = value;
                      }}
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Create Teacher
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Teacher will login with this mobile number (no password required initially)
                  </p>
                </div>
              </form>
            </div>

            {/* Existing Teachers List */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-600" />
                  Existing Teachers ({teachers.length})
                </h2>
                <button
                  onClick={loadTeachers}
                  disabled={teachersLoading}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  {teachersLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {teachersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No teachers found</p>
                  <p className="text-sm">Create your first teacher account to get started</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teachers.map((teacher) => (
                    <div key={teacher._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {teacher.name || 'Name not set'}
                          </h3>
                          <p className="text-sm text-gray-600">📱 {teacher.mobile}</p>
                          {teacher.email && (
                            <p className="text-sm text-gray-600">✉️ {teacher.email}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {teacher.isProfileComplete ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              ✅ Active
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              ⏳ Pending Setup
                            </span>
                          )}
                          {teacher.isOnline && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              🟢 Online
                            </span>
                          )}
                        </div>
                      </div>

                      {teacher.subject && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">📚 Subject: </span>
                          <span className="text-sm font-medium">{teacher.subject}</span>
                        </div>
                      )}

                      {teacher.experience > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">🎓 Experience: </span>
                          <span className="text-sm font-medium">{teacher.experience} years</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Joined: {new Date(teacher.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Reset password functionality
                              const resetPassword = async () => {
                                try {
                                  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
                                  const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/reset-teacher-password/${teacher._id}`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    }
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    toast.success(`Password reset! New password: ${result.data.tempPassword}`);
                                  } else {
                                    toast.error(result.message || 'Failed to reset password');
                                  }
                                } catch (error) {
                                  toast.error('Failed to reset password');
                                }
                              };
                              if (window.confirm(`Reset password for ${teacher.name || teacher.mobile}?`)) {
                                resetPassword();
                              }
                            }}
                            className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => {
                              // Delete teacher functionality
                              const deleteTeacher = async () => {
                                try {
                                  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
                                  const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/teacher/${teacher._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    }
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    toast.success('Teacher deleted successfully');
                                    loadTeachers(); // Refresh list
                                  } else {
                                    toast.error(result.message || 'Failed to delete teacher');
                                  }
                                } catch (error) {
                                  toast.error('Failed to delete teacher');
                                }
                              };
                              if (window.confirm(`Delete teacher ${teacher.name || teacher.mobile}? This cannot be undone.`)) {
                                deleteTeacher();
                              }
                            }}
                            className="px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Teacher Creation Process:</h3>
              
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    1
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Admin Creates Account</h4>
                  <p className="text-sm text-gray-600">Admin enters teacher's mobile number and creates account</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    2
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Initial Login</h4>
                  <p className="text-sm text-gray-600">Teacher logs in with mobile number only (no password needed)</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    3
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Complete Profile</h4>
                  <p className="text-sm text-gray-600">Teacher sets name, password, subject, and other details</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    4
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Regular Login</h4>
                  <p className="text-sm text-gray-600">Future logins require mobile number + password</p>
                </div>
              </div>

              {/* Teacher Login Instructions */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  ✓ For Teachers:
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• First time: Login with mobile number only (no password)</li>
                  <li>• Complete your profile with name, password, and subject details</li>
                  <li>• After setup: Login with mobile number + password</li>
                  <li>• You can change your password anytime from your dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCourseCreated = () => {
    // Refresh dashboard data from backend
    loadDashboardData();
    
    // Add to recent activity for immediate feedback
    const newActivity: RecentActivity = {
      id: Date.now().toString(),
      type: 'course_access',
      description: 'New course created successfully',
      timestamp: 'Just now',
      user: 'Admin'
    };
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'login':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'course_access':
        return <Eye className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const adminActions = [
    {
      title: 'Create Course',
      description: 'Add new courses to the platform',
      icon: Plus,
      color: 'bg-primary-500',
      action: () => setShowCreateCourseModal(true)
    },
    {
      title: 'Manage Teachers',
      description: 'Create and manage teacher accounts',
      icon: GraduationCap,
      color: 'bg-indigo-500',
      action: () => setCurrentView('teachers')
    },
    {
      title: 'Google Meet Scheduler',
      description: 'Schedule daily classes and live sessions',
      icon: Video,
      color: 'bg-green-500',
      action: () => setCurrentView('meet-scheduler')
    },
    {
      title: 'Live Class Manager',
      description: 'Manage daily Google Meet links for courses',
      icon: Activity,
      color: 'bg-red-500',
      action: () => setCurrentView('live-classes')
    },
    {
      title: 'Manage Students',
      description: 'View and manage student accounts',
      icon: Users,
      color: 'bg-blue-500',
      action: () => setCurrentView('users')
    },
    {
      title: 'Current Affairs',
      description: 'Manage current affairs articles for students',
      icon: FileText,
      color: 'bg-green-500',
      action: () => setCurrentView('current-affairs')
    },
    {
      title: 'Course Overview & Analytics',
      description: 'View detailed course analytics and management',
      icon: BarChart3,
      color: 'bg-purple-500',
      action: () => setCurrentView('overview')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                View Website
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{(stats.totalStudents || 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+3</span>
              <span className="text-gray-500 ml-1">new courses</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{((stats.totalRevenue || 0) / 100000).toFixed(1)}L</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+18%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{(stats.activeUsers || 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className="flex items-start">
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-4`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All Activity
              </button>
            </div>
          </div>
        </div>

        {/* Admin Status */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-primary-900">Admin Access Active</h3>
              <p className="text-primary-700">
                You have full administrative privileges. Use these powers responsibly to manage the IASDesk platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
};

export default SimplifiedAdminDashboard;
