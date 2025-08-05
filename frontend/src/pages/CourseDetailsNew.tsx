import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Star, 
  BookOpen,
  CheckCircle,
  PlayCircle,
  Award,
  ArrowLeft,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  instructor: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  features: string[];
  syllabus: {
    module: string;
    topics: string[];
  }[];
  meetLink?: string;
  meetSchedule?: string;
}

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching course details for ID:', courseId);
        
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        console.log('Course details response:', data);

        if (data.success && data.data && data.data.course) {
          const courseData = data.data.course;
          
          // Transform backend course data to match frontend interface
          const transformedCourse: Course = {
            id: courseData._id,
            title: courseData.title,
            description: courseData.description,
            longDescription: courseData.description, // Use same description for now
            instructor: courseData.instructor?.name || 'IASDesk Faculty',
            price: courseData.price,
            originalPrice: courseData.originalPrice || Math.round(courseData.price * 1.5),
            image: courseData.imageURL || '/api/placeholder/600/300',
            category: courseData.category,
            level: (courseData.level as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
            features: courseData.features || [
              'Live Google Meet Sessions',
              'One Year Full Access',
              'Mobile & desktop access',
              'Weekly Mock Tests'
            ],
            syllabus: courseData.curriculum?.map((module: any) => ({
              module: module.title || 'Course Module',
              topics: module.topics || ['Course Topics']
            })) || [
              {
                module: 'Introduction',
                topics: ['Getting Started', 'Course Overview']
              }
            ]
          };

          console.log('Transformed course:', transformedCourse);
          setCourse(transformedCourse);
        } else {
          console.error('Course not found or API error:', data);
          setCourse(null);
          toast.error('Course not found');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        setCourse(null);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();

    // Load enrolled courses
    const enrolled = localStorage.getItem('enrolledCourses');
    if (enrolled) {
      setEnrolledCourses(JSON.parse(enrolled));
    }
  }, [courseId]);

  const handleEnrollCourse = () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in courses');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    if (course) {
      const updatedEnrolled = [...enrolledCourses, course.id];
      setEnrolledCourses(updatedEnrolled);
      localStorage.setItem('enrolledCourses', JSON.stringify(updatedEnrolled));
      
      // Also store course details for better display
      const enrolledCoursesDetails = JSON.parse(localStorage.getItem('enrolledCoursesDetails') || '{}');
      enrolledCoursesDetails[course.id] = {
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        category: course.category
      };
      localStorage.setItem('enrolledCoursesDetails', JSON.stringify(enrolledCoursesDetails));
      
      setShowPaymentModal(false);
      toast.success(`Successfully enrolled in ${course.title}!`);
    }
  };

  const isEnrolled = () => {
    return isAuthenticated && course ? enrolledCourses.includes(course.id) : false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/courses"
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Courses
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">By {course.instructor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  {course.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-200 mb-6">{course.description}</p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  <span>By {course.instructor}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2">₹{course.price.toLocaleString()}</div>
                  {course.originalPrice > course.price && (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg line-through text-gray-300">₹{course.originalPrice.toLocaleString()}</span>
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                        {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {isEnrolled() ? (
                  <div className="space-y-3">
                    <Link
                      to={`/course-content/${course.id}`}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Continue Learning
                    </Link>
                    <div className="text-center text-sm text-gray-300">
                      ✓ You are enrolled in this course
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleEnrollCourse}
                    className="w-full bg-white text-primary-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Enroll Now
                  </button>
                )}

                <div className="mt-6 text-sm text-gray-300 space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Live Google Meet Sessions</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>One Year Full Access</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Mobile & desktop access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'instructor', label: 'Instructor' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">About this course</h3>
                  <p className="text-gray-600 leading-relaxed">{course.longDescription}</p>
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your instructor</h3>
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <Award className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{course.instructor}</h4>
                    <p className="text-gray-600 mb-4">
                      Expert faculty member with extensive experience in competitive exam preparation.
                      Specialized in creating comprehensive courses that help students achieve their goals.
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>1000+ students taught</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        <span>4.8 instructor rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Enroll in Course</h3>
            <div className="mb-6">
              <h4 className="font-medium text-gray-900">{course.title}</h4>
              <p className="text-2xl font-bold text-primary-600 mt-2">₹{course.price.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">This is a demo payment. In production, integrate with:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                <li>Razorpay</li>
                <li>Stripe</li>
                <li>PayPal</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Complete Payment (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
