import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Star, 
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

const Courses: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let url = '/api/courses';
        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
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
            instructor: course.instructor?.name || 'IASDesk Faculty',
            duration: course.duration || '6 months',
            lessons: course.curriculum?.reduce((total: number, module: any) => total + (module.topics?.length || 0), 0) || 10,
            students: course.enrollmentCount || 0,
            rating: course.rating || 4.5,
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
              topics: module.topics || ['Course Topics'],
              duration: '10 hours'
            })) || [
              {
                module: 'Introduction',
                topics: ['Getting Started', 'Course Overview'],
                duration: '5 hours'
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
    // Enrolled courses are now fetched from the user profile via AuthContext
  }, [category]);

  const handleEnrollCourse = (course: Course) => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in courses');
      return;
    }

    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (course: Course) => {
    const updatedEnrolled = [...enrolledCourses, course.id];
    setEnrolledCourses(updatedEnrolled);
    // Course enrollment is now handled by the backend
    // The user's enrolled courses will be updated in their profile
    
    setShowPaymentModal(false);
    setSelectedCourse(null);
    toast.success(`Successfully enrolled in ${course.title}!`);
  };

  const isEnrolled = (courseId: string) => {
    return isAuthenticated && enrolledCourses.includes(courseId);
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'upsc':
        return 'UPSC Civil Services';
      case 'school':
        return 'Class 5-12';
      case 'ssc':
        return 'SSC Exams';
      case 'banking':
        return 'Banking';
      case 'state-psc':
        return 'State PSC';
      case 'jee-neet':
        return 'JEE & NEET';
      default:
        return 'All Courses';
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getCategoryTitle()}</h1>
              <p className="text-gray-600 mt-2">
                {courses.length} course{courses.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
              {category 
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{course.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.lessons} lessons</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
                      {course.originalPrice > course.price && (
                        <span className="text-lg text-gray-500 line-through">₹{course.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {course.originalPrice > course.price && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {isEnrolled(course.id) ? (
                      <div className="flex space-x-2">
                        <Link
                          to={`/course-content/${course.id}`}
                          className="flex-1 bg-green-600 text-white text-center py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Link>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Link
                          to={`/course/${course.id}`}
                          className="flex-1 border border-primary-600 text-primary-600 text-center py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleEnrollCourse(course)}
                          className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
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
                onClick={() => handlePaymentSuccess(selectedCourse)}
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

export default Courses;
