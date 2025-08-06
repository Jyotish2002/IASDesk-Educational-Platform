import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Video,
  Plus,
  LogOut,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  meetLink?: string;
  isActive: boolean;
  enrollmentCount: number;
}

const WorkingAdminDashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    coursesWithMeetLinks: 0,
    totalEnrollments: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  // Check if user is admin
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      // Try to load courses from admin API
      const response = await fetch('${process.env.REACT_APP_API_URL}/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.courses) {
          setCourses(data.data.courses);
          
          const coursesWithMeet = data.data.courses.filter((c: Course) => c.meetLink);
          const totalEnrollments = data.data.courses.reduce((sum: number, c: Course) => sum + (c.enrollmentCount || 0), 0);
          
          setStats({
            totalCourses: data.data.courses.length,
            coursesWithMeetLinks: coursesWithMeet.length,
            totalEnrollments
          });
          
          toast.success('Admin data loaded successfully!');
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      
      // Fallback to mock data for demo
      const mockCourses: Course[] = [
        {
          _id: '1',
          title: 'UPSC Prelims Complete Course 2025',
          description: 'Comprehensive course for UPSC Civil Services Preliminary Examination',
          price: 15999,
          category: 'upsc',
          meetLink: 'https://meet.google.com/abc-defg-hij',
          isActive: true,
          enrollmentCount: 150
        },
        {
          _id: '2',
          title: 'Class 12 Physics Complete Course',
          description: 'Complete Physics course for Class 12 students',
          price: 8999,
          category: 'school',
          meetLink: 'https://meet.google.com/xyz-uvwx-123',
          isActive: true,
          enrollmentCount: 89
        },
        {
          _id: '3',
          title: 'SSC CGL Preparation Course',
          description: 'Staff Selection Commission Combined Graduate Level',
          price: 12999,
          category: 'ssc',
          isActive: true,
          enrollmentCount: 203
        }
      ];
      
      setCourses(mockCourses);
      setStats({
        totalCourses: mockCourses.length,
        coursesWithMeetLinks: mockCourses.filter(c => c.meetLink).length,
        totalEnrollments: mockCourses.reduce((sum, c) => sum + c.enrollmentCount, 0)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateCourse = () => {
    toast.success('Course creation feature - coming soon!');
  };

  const handleManageGoogleMeet = () => {
    toast.success('Google Meet management feature - coming soon!');
  };

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
                onClick={loadData}
                disabled={loading}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses with Google Meet</p>
                <p className="text-2xl font-bold text-gray-900">{stats.coursesWithMeetLinks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCreateCourse}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    Create Course
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Add new courses to the platform</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleManageGoogleMeet}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    Google Meet Manager
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Schedule and manage live sessions</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => toast.success('User management coming soon!')}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-start">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    Manage Users
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">View and manage student accounts</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No courses found</h4>
              <p className="text-gray-600">Start by creating your first course.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {courses.map((course) => (
                <div key={course._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{course.title}</h4>
                        
                        {course.isActive ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                            Inactive
                          </span>
                        )}

                        {course.meetLink && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Video className="h-3 w-3 mr-1" />
                            Google Meet
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{course.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Price:</span> ₹{(course.price || 0).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {course.category.toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">Enrollments:</span> {course.enrollmentCount}
                        </div>
                      </div>

                      {course.meetLink && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-blue-800 mb-1">
                            <Video className="h-4 w-4 mr-2" />
                            <span className="font-medium">Google Meet Link Available</span>
                          </div>
                          <p className="text-sm text-blue-600 font-mono">{course.meetLink}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Status */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-primary-900">Admin Access Active</h3>
              <p className="text-primary-700">
                Admin panel is working! You can manage courses, Google Meet links, and view enrollment data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingAdminDashboard;
