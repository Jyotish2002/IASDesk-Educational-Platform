import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3,
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  LogOut,
  Plus,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateCourseModal from '../components/CreateCourseModal';
import GoogleMeetScheduler from '../components/GoogleMeetScheduler';
import LiveClassManager from '../components/LiveClassManager';
import UserManagement from '../components/UserManagement';

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
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'meet-scheduler' | 'live-classes' | 'users'>('dashboard');

  useEffect(() => {
    // Mock dashboard data
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
  }, []);

  // Check if user is admin
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  // Handle view switching
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCourseCreated = () => {
    // Refresh stats after course creation
    setStats(prev => ({
      ...prev,
      totalCourses: prev.totalCourses + 1
    }));
    
    // Add to recent activity
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
      title: 'Course Overview',
      description: 'Monitor course performance and enrollment',
      icon: BookOpen,
      color: 'bg-green-500',
      action: () => toast.success('Course overview feature coming soon')
    },
    {
      title: 'Website Settings',
      description: 'Configure website settings and preferences',
      icon: Settings,
      color: 'bg-purple-500',
      action: () => toast.success('Settings panel coming soon')
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: BarChart3,
      color: 'bg-orange-500',
      action: () => toast.success('Analytics dashboard coming soon')
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
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
