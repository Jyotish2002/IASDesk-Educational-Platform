import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  Calendar,
  Video,
  Star,
  ArrowRight,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tokenUtils } from '../utils/token';

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  lastAccessed?: string;
  enrollmentDate?: string;
  rating?: number;
  image?: string;
  meetLink?: string;
  hasLiveSessions?: boolean;
}

const MyCourses: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadEnrolledCourses();
    }
  }, [isAuthenticated]);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      
      // Get user's enrolled courses from backend with payment verification
      const token = tokenUtils.getToken();
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const userData = await response.json();
      
      console.log('User data from API:', userData); // Debug log
      
      if (userData.success && userData.data.user && userData.data.user.enrolledCourses) {
        // Filter only courses with payment verification
        const validEnrollments = userData.data.user.enrolledCourses.filter((enrollment: any) => 
          enrollment.paymentId // Only show courses with valid payment
        );

        const courses: Course[] = validEnrollments.map((enrollment: any) => {
          const course = enrollment.courseId;
          console.log('Course data:', course); // Debug log
          return {
            id: course._id || course,
            title: course.title || `Course ${course._id || course}`,
            instructor: course.instructor?.name || course.instructor || 'Expert Instructor',
            category: course.category || 'General',
            lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            enrollmentDate: enrollment.enrolledAt || new Date().toISOString(),
            rating: course.rating || (4.5 + Math.random() * 0.5),
            image: course.imageURL || course.image || `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80`,
            meetLink: course.meetLink, // Add meeting link info
            hasLiveSessions: course.liveSessions && course.liveSessions.filter((session: any) => {
              // Filter out demo/test sessions
              const sessionTitle = session.title?.toLowerCase() || '';
              return session.isActive && 
                     !sessionTitle.includes('demo') && 
                     !sessionTitle.includes('test') && 
                     sessionTitle !== 'english' &&
                     sessionTitle.length >= 5;
            }).length > 0 // Only count non-demo live sessions
          };
        });
        
        setEnrolledCourses(courses);
      } else {
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCourses = () => {
    return enrolledCourses;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Continue your learning journey with {enrolledCourses.length} enrolled course{enrolledCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrolledCourses.length > 0 
                    ? (enrolledCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / enrolledCourses.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Enrolled Courses</h2>
            <p className="text-sm text-gray-600 mt-1">Access all your enrolled courses and continue learning</p>
          </div>
        </div>

        {/* Courses Grid */}
        {getFilteredCourses().length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses enrolled yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredCourses().map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                  {course.image && (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-green-500">
                      Enrolled
                    </span>
                  </div>
                  {(course.meetLink || course.hasLiveSessions) && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-blue-500">
                        <Video className="h-3 w-3 mr-1" />
                        Live Classes
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">By {course.instructor}</p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>{course.rating?.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Enrollment Date */}
                  <p className="text-xs text-gray-500 mb-4">
                    Enrolled: {formatDate(course.enrollmentDate || '')}
                  </p>

                  {/* Live Classes Info */}
                  {(course.meetLink || course.hasLiveSessions) && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center text-blue-800 mb-1">
                        <Video className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Live Classes Available</span>
                      </div>
                      <p className="text-xs text-blue-600">
                        {course.meetLink && course.hasLiveSessions 
                          ? 'Regular classes + Special sessions'
                          : course.meetLink 
                          ? 'Regular live classes'
                          : 'Special live sessions'
                        }
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/course-content/${course.id}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Link>
                    <Link
                      to={`/course-details/${course.id}`}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/courses"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Browse More Courses</h4>
                <p className="text-sm text-gray-500">Discover new learning opportunities</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>

            <Link
              to="/live-classes"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Video className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Live Classes</h4>
                <p className="text-sm text-gray-500">Join live sessions with instructors</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>

            <Link
              to="/chat"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Chat with Teachers</h4>
                <p className="text-sm text-gray-500">Get instant help and doubt resolution</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>

            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Study Schedule</h4>
                <p className="text-sm text-gray-500">Plan your learning routine</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
