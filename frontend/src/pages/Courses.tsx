import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Play, 
  BookOpen, 
  Award,
  CheckCircle,
  Calendar,
  Video,
  Download,
  Lock,
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

const Courses: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  // Get category from either URL params or query params
  const currentCategory = category || searchParams.get('category') || '';
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let url = `${process.env.REACT_APP_API_URL}/courses`;
        if (currentCategory) {
          url += `?category=${encodeURIComponent(currentCategory)}`;
        }

        console.log('Fetching courses from:', url);
        const response = await fetch(url);
        const data = await response.json();

        console.log('Courses response:', data);

        if (data.success && data.data && data.data.courses) {
          // Transform backend course data to match frontend interface
          const transformedCourses = data.data.courses.map((course: any) => ({
            id: course._id,
            title: course.title,
            description: course.description,
            longDescription: course.description, // Use same description for now
            instructor: course.instructor?.name || 'IASDesk Expert Faculty',
            price: course.price,
            originalPrice: course.originalPrice || Math.round(course.price * 1.5),
            image: course.imageURL || '/api/placeholder/400/250',
            category: course.category.toLowerCase().replace(/\s+/g, '-'),
            level: (course.level as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
            features: course.features || [
              'Live Google Meet Sessions',
              'One Year Full Access',
              'Mobile & desktop access',
              'Weekly Mock Tests'
            ],
            syllabus: course.curriculum?.map((module: any) => ({
              module: module.title || 'Course Module',
              topics: module.topics || ['Course Topics']
            })) || [
              {
                module: 'Introduction',
                topics: ['Getting Started', 'Course Overview']
              }
            ]
          }));

          console.log('Transformed courses:', transformedCourses);
          setCourses(transformedCourses);
        } else {
          console.log('No courses found or API error, using fallback');
          setCourses([]); // Show empty state instead of mock data
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]); // Show empty state on error
        toast.error('Failed to load courses. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    // Load enrolled courses from backend API if authenticated
    if (isAuthenticated) {
      loadEnrolledCourses();
    }
  }, [currentCategory, isAuthenticated]);

  const loadEnrolledCourses = async () => {
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
        // Only include courses with valid payment
        const validEnrollments = userData.data.user.enrolledCourses
          .filter((enrollment: any) => enrollment.paymentId)
          .map((enrollment: any) => enrollment.courseId._id || enrollment.courseId);
        
        setEnrolledCourses(validEnrollments);
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      setEnrolledCourses([]);
    }
  };

  const handleEnrollCourse = (course: Course) => {
    if (!isAuthenticated) {
      setSelectedCourse(course);
      setShowAuthModal(true);
      return;
    }

    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  const handleAuthSuccess = () => {
    // After successful authentication, proceed to payment
    if (selectedCourse) {
      setShowPaymentModal(true);
    }
  };

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const handlePaymentSuccess = async (course: Course) => {
    if (!course) return;

    try {
      const token = tokenUtils.getToken();
      
      if (!token) {
        toast.error('Please login to purchase courses');
        return;
      }
      
      console.log('Initiating payment for course:', course.title);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
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

      console.log('Order response status:', orderResponse.status);
      const orderData = await orderResponse.json();
      console.log('Order response data:', orderData);
      
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
            console.log('Payment completed, verifying...', response);
            
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
            console.log('Verification response:', verifyData);
            
            if (verifyData.success) {
              toast.success('Payment successful! You are now enrolled in the course.');
              // Reload enrollment status from backend
              await loadEnrolledCourses();
              setShowPaymentModal(false);
              setSelectedCourse(null);
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
      toast.error('Payment initialization failed: ' + (error as Error).message);
    }
  };

  const isEnrolled = (courseId: string) => {
    return isAuthenticated && enrolledCourses.includes(courseId);
  };

  const getCategoryTitle = () => {
    const categoryName = currentCategory;
    if (!categoryName) return 'All Courses';
    
    // Return the category name as is for better display
    return categoryName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          {currentCategory && (
            <nav className="flex mb-3 sm:mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
                <li className="inline-flex items-center">
                  <Link
                    to="/"
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link
                      to="/courses"
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 md:ml-2"
                    >
                      All Courses
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="ml-1 text-sm font-medium text-primary-600 md:ml-2">
                      {getCategoryTitle()}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getCategoryTitle()}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                {courses.length} course{courses.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <select 
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base w-full sm:w-auto"
                value={currentCategory}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  if (newCategory) {
                    window.location.href = `/courses?category=${encodeURIComponent(newCategory)}`;
                  } else {
                    window.location.href = '/courses';
                  }
                }}
              >
                <option value="">All Categories</option>
                <option value="UPSC">UPSC Civil Services</option>
                <option value="UPSC Prelims">UPSC Prelims</option>
                <option value="UPSC Mains">UPSC Mains</option>
                <option value="UPSC Interview">UPSC Interview</option>
                <option value="UPSC Optional">UPSC Optional</option>
                <option value="Class 5-12">Class 5-12</option>
                <option value="Class 5-8">Class 5-8</option>
                <option value="Class 9-10">Class 9-10</option>
                <option value="Class 11-12 Science">Class 11-12 Science</option>
                <option value="Class 11-12 Commerce">Class 11-12 Commerce</option>
                <option value="SSC">SSC Exams</option>
                <option value="Banking">Banking</option>
                <option value="State PSC">State PSC</option>
                <option value="JEE & NEET">JEE & NEET</option>
                <option value="Current Affairs">Current Affairs</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-4 py-2">
                <option>Sort by Popularity</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {currentCategory 
                ? `No courses are available in the ${getCategoryTitle()} category yet.`
                : 'No courses are available yet.'
              }
            </p>
            {user?.isAdmin && (
              <Link
                to="/admin-login"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Courses (Admin)
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                </div>

                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>By {course.instructor}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
                      {course.originalPrice > course.price && (
                        <span className="text-base sm:text-lg text-gray-500 line-through">₹{course.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {course.originalPrice > course.price && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {isEnrolled(course.id) ? (
                      <div className="flex space-x-2">
                        <Link
                          to={`/course-content/${course.id}`}
                          className="flex-1 bg-green-600 text-white text-center py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                        >
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Continue Learning
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleViewDetails(course)}
                          className="flex-1 border border-primary-600 text-primary-600 text-center py-2 sm:py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors text-sm sm:text-base"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleEnrollCourse(course)}
                          className="flex-1 bg-primary-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                        >
                          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Enroll Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {showDetailsModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Course Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Course Info */}
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <img
                      src={selectedCourse.image}
                      alt={selectedCourse.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedCourse.category}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{selectedCourse.title}</h3>
                  <p className="text-gray-600 text-lg mb-6">{selectedCourse.description}</p>
                  
                </div>

                {/* Pricing Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-2xl p-6 sticky top-6">{/* Course Details */}
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        ₹{selectedCourse.price.toLocaleString()}
                      </div>
                      {selectedCourse.originalPrice > selectedCourse.price && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-lg text-gray-500 line-through">
                            ₹{selectedCourse.originalPrice.toLocaleString()}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            {Math.round((1 - selectedCourse.price / selectedCourse.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>

                    {isEnrolled(selectedCourse.id) ? (
                      <div className="space-y-3">
                        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium">
                          ✓ Enrolled
                        </button>
                        <Link
                          to={`/course-content/${selectedCourse.id}`}
                          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center block"
                        >
                          Continue Learning
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleEnrollCourse(selectedCourse);
                        }}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Enroll Now
                      </button>
                    )}

                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Live Google Meet Sessions</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>One Year Full Access</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Mobile & desktop access</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Expert doubt support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Enroll in Course</h3>
            <div className="mb-6">
              <h4 className="font-medium text-gray-900">{selectedCourse.title}</h4>
              <p className="text-2xl font-bold text-primary-600 mt-2">₹{selectedCourse.price.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Thanks for choosing the best course</p>
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
                onClick={() => handlePaymentSuccess(selectedCourse)}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Complete Payment
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
        subtitle={selectedCourse ? `Please login or register to enroll in "${selectedCourse.title}"` : "Please login or register to enroll in this course"}
      />
      <FloatingCallButtonGlobal />
    </div>
  );
};

export default Courses;
