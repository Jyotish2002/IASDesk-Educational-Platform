import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpen, Video, Calendar } from 'lucide-react';

interface Instructor {
  name: string;
  bio: string;
  imageURL?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  level: string;
  duration: string;
  features: string[];
  imageURL: string;
  enrollmentCount: number;
  rating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  meetLink?: string;
  videoURL?: string;
  instructor?: Instructor;
  meetSchedule?: {
    dailyTime: string;
    timezone: string;
    isActive: boolean;
  };
  liveSessions?: LiveSession[];
}

interface LiveSession {
  _id: string;
  date: string;
  time: string;
  meetLink: string;
  title: string;
  isActive: boolean;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add API URL helper function
  const getApiUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      console.warn('REACT_APP_API_URL not set, using default localhost:5000');
      return 'http://localhost:5000/api';
    }
    return apiUrl;
  };

  useEffect(() => {
    // Check if user is admin
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminToken) {
      setIsAdmin(true);
    }
    
    const fetchCourseDetail = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        if (!token) {
          toast.error('Authentication required. Please login again.');
          return;
        }
        
        const response = await fetch(`${getApiUrl()}/courses/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCourse(data.data.course);
            
            // Check enrollment status if user is not admin
            if (!adminToken) {
              await checkEnrollmentStatus();
            }
          } else {
            toast.error(data.message || 'Failed to fetch course details');
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch course details:', errorText);
          toast.error('Failed to fetch course details');
        }
      } catch (error) {
        console.error('Error fetching course detail:', error);
        toast.error('Failed to load course detail: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollmentStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${getApiUrl()}/courses/${id}/enrollment-status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsEnrolled(data.data.isEnrolled);
          }
        }
      } catch (error) {
        console.error('Error checking enrollment status:', error);
      }
    };

    fetchCourseDetail();
  }, [id]);

  const handleEnrollment = async () => {
    if (isAdmin) {
      toast.error('Admins cannot enroll in courses. Please use a student account.');
      return;
    }

    setEnrolling(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch(`${getApiUrl()}/enrollment/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsEnrolled(true);
          toast.success('Enrolled in course successfully');
          // Update course enrollment count
          if (course) {
            setCourse({
              ...course,
              enrollmentCount: course.enrollmentCount + 1
            });
          }
        } else {
          toast.error(data.message || 'Failed to enroll in course');
        }
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to enroll in course';
        console.error('Failed to enroll in course:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setEnrolling(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-500 mb-6">
            The course you are looking for does not exist or has been removed.
          </p>
          <a
            href="/courses"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0l-3-3m3 3l-3 3" />
            </svg>
            Back to Courses
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Course Detail Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 mb-4 lg:mb-0 lg:pr-6">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-sm text-gray-500 mb-4">
              Created: {new Date(course.createdAt).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {course.category}
              </span>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                course.level === 'Advanced' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {course.level}
              </span>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:flex-col lg:gap-2">
            <div className="text-center lg:text-right">
              <span className="block text-xs font-medium text-gray-500">Price</span>
              <div className="flex items-center justify-center lg:justify-end space-x-2">
                <span className="text-xl lg:text-2xl font-bold text-green-600">
                  {formatCurrency(course.price)}
                </span>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(course.originalPrice)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <span className="block text-xs font-medium text-gray-500">Duration</span>
              <span className="text-lg font-bold text-gray-900">
                {course.duration}
              </span>
            </div>
            
            <div className="text-center lg:text-right">
              <span className="block text-xs font-medium text-gray-500">Enrolled</span>
              <span className="text-lg font-bold text-gray-900">
                {course.enrollmentCount} students
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Description */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">{course.description}</p>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          {course.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        {course.instructor && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructor</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200">
                <img 
                  src={course.instructor.imageURL || 'https://via.placeholder.com/48x48?text=IN'}
                  alt={course.instructor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=IN';
                  }}
                />
              </div>
              <div>
                <p className="text-gray-900 font-medium">{course.instructor.name}</p>
                <p className="text-sm text-gray-500">{course.instructor.bio}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Enrollment Section */}
      {!isEnrolled && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {isAdmin ? (
            <div className="text-center py-8">
              <div className="text-yellow-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Admin Account Detected
              </h3>
              <p className="text-gray-600 mb-4">
                Admins cannot enroll in courses. Please use a student account to access course content.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  window.location.href = '/auth/login';
                }}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Switch to Student Login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready to start learning?</h3>
                  <p className="text-sm text-gray-600">Get instant access to all course materials</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(course.price)}
                  </div>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <div className="text-sm text-gray-400 line-through">
                      {formatCurrency(course.originalPrice)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleEnrollment}
                disabled={enrolling || !course.isActive}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : !course.isActive ? (
                  'Course Not Available'
                ) : (
                  `Enroll Now - ${formatCurrency(course.price)}`
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Course Content - Only for enrolled students */}
      {isEnrolled && !isAdmin && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Video className="w-6 h-6 mr-2 text-primary-600" />
            Course Content
          </h2>
          
          <div className="space-y-6">
            {course.liveSessions && course.liveSessions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Live Sessions
                </h3>
                <div className="space-y-3">
                  {course.liveSessions.filter(session => session.isActive).map(session => (
                    <div key={session._id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-gray-900">{session.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(session.date).toLocaleDateString()} at {session.time}
                        </p>
                      </div>
                      <a
                        href={session.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Join Meeting
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {course.meetLink && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Regular Classes</h3>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-700 mb-3">Join the regular class sessions</p>
                  <a
                    href={course.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Join Class
                  </a>
                </div>
              </div>
            )}

            {course.videoURL && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Video</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={course.videoURL}
                    title="Course Video"
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {!course.liveSessions?.length && !course.meetLink && !course.videoURL && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Course content will be available soon</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;