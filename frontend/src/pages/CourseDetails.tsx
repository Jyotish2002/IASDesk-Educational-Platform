import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  CheckCircle,
  Video,
  Download,
  PlayCircle,
  Award,
  Calendar,
  ArrowLeft,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import FloatingCallButtonGlobal from '../components/FloatingCallButtonGlobal';
import { tokenUtils } from '../utils/token';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  instructor: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  features: string[];
  syllabus: {
    module: string;
    topics: string[];
    duration: string;
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
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Mock course data (same as in Courses component)
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'UPSC Prelims Complete Course 2025',
      description: 'Comprehensive preparation for UPSC Civil Services Preliminary Examination',
      longDescription: 'Master the UPSC Prelims with our comprehensive course covering all subjects including History, Geography, Polity, Economy, Environment, Science & Technology, and Current Affairs. Get access to 500+ hours of live Google Meet sessions, 10,000+ practice questions, and weekly mock tests. Our expert faculty with years of experience will guide you through every topic with detailed explanations and exam strategies.',
      instructor: 'Dr. Rajesh Kumar',
      duration: '12 months',
      lessons: 150,
      students: 12500,
      rating: 4.8,
      price: 15999,
      originalPrice: 25999,
      image: '/api/placeholder/600/300',
      category: 'upsc',
      level: 'Intermediate',
      features: [
        '500+ Hours of Live Google Meet Sessions',
        '10,000+ Practice Questions',
        'Weekly Mock Tests',
        'Current Affairs Updates',
        'Doubt Clearing Sessions',
        'Study Material PDF',
        'Mobile App Access',
        '1 Year Validity',
        'Live Classes with Experts',
        'Personal Mentorship',
        'Performance Analytics',
        'Previous Year Papers'
      ],
      syllabus: [
        {
          module: 'History & Culture',
          topics: ['Ancient India', 'Medieval India', 'Modern India', 'Art & Culture', 'Freedom Struggle', 'Post Independence'],
          duration: '45 hours'
        },
        {
          module: 'Geography',
          topics: ['Physical Geography', 'Human Geography', 'Indian Geography', 'World Geography', 'Environmental Geography'],
          duration: '40 hours'
        },
        {
          module: 'Polity & Governance',
          topics: ['Constitution', 'Political System', 'Governance', 'Public Policy', 'Rights & Duties'],
          duration: '50 hours'
        },
        {
          module: 'Economy',
          topics: ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Economic Planning', 'Banking & Finance'],
          duration: '45 hours'
        },
        {
          module: 'Environment & Ecology',
          topics: ['Ecosystem', 'Biodiversity', 'Climate Change', 'Environmental Laws', 'Conservation'],
          duration: '35 hours'
        },
        {
          module: 'Science & Technology',
          topics: ['Physics', 'Chemistry', 'Biology', 'Space Technology', 'Defence Technology'],
          duration: '40 hours'
        }
      ],
      meetLink: 'https://meet.google.com/abc-defg-hij',
      meetSchedule: 'Every Sunday 10:00 AM - 12:00 PM'
    }
  ];

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
            duration: courseData.duration || '6 months',
            lessons: courseData.curriculum?.reduce((total: number, module: any) => total + (module.topics?.length || 0), 0) || 10,
            students: courseData.enrollmentCount || 0,
            rating: courseData.rating || 4.5,
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
              topics: module.topics || ['Course Topics'],
              duration: '10 hours'
            })) || [
              {
                module: 'Introduction',
                topics: ['Getting Started', 'Course Overview'],
                duration: '5 hours'
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

    // Check enrollment status from backend if authenticated
    if (isAuthenticated) {
      checkEnrollmentStatus();
    }
  }, [courseId, isAuthenticated]);

  const checkEnrollmentStatus = async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const userData = await response.json();
      
      if (userData.success && userData.data.user && userData.data.user.enrolledCourses) {
        const userEnrolledCourses = userData.data.user.enrolledCourses
          .filter((enrollment: any) => enrollment.paymentId) // Only courses with valid payment
          .map((enrollment: any) => enrollment.courseId._id || enrollment.courseId);
        
        setEnrolledCourses(userEnrolledCourses);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  const handleEnrollCourse = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowPaymentModal(true);
  };

  const handleAuthSuccess = () => {
    // After successful authentication, proceed to payment
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!course) return;

    try {
      const token = tokenUtils.getToken();
      
      // Create order
      const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: course.id,
          amount: course.price
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        toast.error(orderData.message || 'Failed to create order');
        return;
      }

      const options = {
        key: orderData.data.keyId, // Use the key from backend response
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "IASDesk",
        description: course.title,
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${process.env.REACT_APP_API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course.id
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast.success('Payment successful! You are now enrolled in the course.');
              setEnrolledCourses([...enrolledCourses, course.id]);
              setShowPaymentModal(false);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#3B82F6"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment initialization failed');
    }
  };

  const isEnrolled = () => {
    return isAuthenticated && course ? enrolledCourses.includes(course.id) : false;
  };

  const joinMeeting = () => {
    if (course?.meetLink) {
      window.open(course.meetLink, '_blank');
      toast.success('Opening Google Meet...');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <Link to="/courses" className="text-primary-600 hover:text-primary-700">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Link to="/courses" className="flex items-center text-primary-600 hover:text-primary-700 text-sm sm:text-base">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <span className="bg-primary-100 text-primary-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {course.category.toUpperCase()}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {course.level}
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{course.title}</h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6">{course.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:space-x-6 gap-3 sm:gap-4 lg:gap-0 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>By {course.instructor}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-yellow-400 fill-current" />
                    <span>{course.rating} ({Math.floor(course.students * 0.7)} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>

              <img
                src={course.image}
                alt={course.title}
                className="w-full h-64 object-cover rounded-xl mb-8"
              />
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-4">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-primary-600">₹{course.price.toLocaleString()}</span>
                      <span className="text-lg text-gray-500 line-through ml-2">₹{course.originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                    </div>
                  </div>
                </div>

                {isEnrolled() ? (
                  <div className="space-y-4">
                    <div className="flex items-center text-green-600 mb-4">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">You are enrolled in this course</span>
                    </div>
                    
                    <Link
                      to={`/course-content/${course.id}`}
                      className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors text-center block"
                    >
                      Access Course Content
                    </Link>
                    
                    {course.meetLink && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center text-blue-800 mb-2">
                          <Video className="h-5 w-5 mr-2" />
                          <span className="font-medium">Live Classes</span>
                        </div>
                        <p className="text-sm text-blue-600 mb-3">{course.meetSchedule}</p>
                        <button
                          onClick={joinMeeting}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Join Google Meet
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleEnrollCourse}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Enroll Now
                  </button>
                )}

                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-3" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-3" />
                    <span>{course.duration} duration</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Video className="h-4 w-4 mr-3" />
                    <span>HD Video Quality</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Download className="h-4 w-4 mr-3" />
                    <span>Downloadable Resources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {['overview', 'syllabus', 'instructor'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>
                <div className="prose prose-lg text-gray-600 mb-8">
                  <p>{course.longDescription}</p>
                </div>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Syllabus</h2>
                <div className="space-y-6">
                  {course.syllabus.map((module, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{module.module}</h3>
                        <span className="text-sm text-gray-500">{module.duration}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {module.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center">
                            <PlayCircle className="h-4 w-4 text-primary-600 mr-2" />
                            <span className="text-gray-700 text-sm">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet Your Instructor</h2>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <img
                      src="/api/placeholder/80/80"
                      alt={course.instructor}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{course.instructor}</h3>
                      <p className="text-gray-600">Expert Faculty</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    {course.instructor} is a renowned expert in the field with over 15 years of experience in teaching and mentoring students for competitive examinations. With a proven track record of success, they have guided thousands of students to achieve their career goals.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Course Features Sidebar */}
          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Features</h3>
              <div className="space-y-3">
                {course.features.slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enroll in Course</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900">{course.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{course.description}</p>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span>Course Price:</span>
                <span className="line-through text-gray-500">₹{course.originalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Discount:</span>
                <span className="text-green-600">-₹{(course.originalPrice - course.price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                <span>Total Amount:</span>
                <span className="text-primary-600">₹{course.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 text-sm">
                🎉 <strong>Demo Mode:</strong> This is a demonstration. No actual payment will be processed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Complete Enrollment (Demo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Enroll in Course"
        subtitle="Please login or register to enroll in this course"
      />
      <FloatingCallButtonGlobal />
    </div>
  );
};

export default CourseDetails;
