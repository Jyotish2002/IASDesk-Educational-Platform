import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Video,
  Calendar,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

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

interface Analytics {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeCourses: number;
  coursesWithMeetings: number;
  totalLiveSessions: number;
  monthlyGrowth: number;
  popularCategories: Array<{ category: string; count: number }>;
}

const CourseOverview: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [creatingData, setCreatingData] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const createSampleData = async () => {
    setCreatingData(true);
    try {
      const sampleCourses = [
        {
          title: "UPSC CSE Prelims 2025",
          description: "Comprehensive course for UPSC Civil Services Preliminary examination with current affairs and test series.",
          imageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          price: 15000,
          originalPrice: 20000,
          category: "UPSC",
          level: "Intermediate",
          duration: "12 months",
          features: ["Live Classes", "Test Series", "Current Affairs", "Study Material"],
          instructor: {
            name: "Dr. Rajesh Kumar",
            bio: "Former IAS Officer with 15+ years of teaching experience"
          }
        },
        {
          title: "Current Affairs Daily Updates",
          description: "Daily current affairs updates with analysis for competitive exams preparation.",
          imageURL: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400",
          price: 5000,
          originalPrice: 7000,
          category: "Current Affairs",
          level: "Beginner",
          duration: "6 months",
          features: ["Daily Updates", "Weekly Tests", "Monthly Magazine", "Video Analysis"],
          instructor: {
            name: "Ms. Priya Sharma",
            bio: "Subject Matter Expert in Current Affairs"
          }
        },
        {
          title: "UPSC Mains Essay Writing",
          description: "Master the art of essay writing for UPSC Mains examination with expert guidance.",
          imageURL: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
          price: 8000,
          originalPrice: 12000,
          category: "UPSC",
          level: "Advanced",
          duration: "4 months",
          features: ["Practice Sessions", "Expert Review", "Sample Essays", "One-on-One Guidance"],
          instructor: {
            name: "Prof. Amit Singh",
            bio: "Former UPSC Examiner and Essay Expert"
          }
        }
      ];

      const createdCourses = [];
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      for (const courseData of sampleCourses) {
        const response = await fetch('${process.env.REACT_APP_API_URL}/admin/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(courseData)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            createdCourses.push(result.data.course);
          }
        }
      }

      if (createdCourses.length > 0) {
        toast.success(`Created ${createdCourses.length} sample courses successfully!`);
        await fetchData(); // Refresh data
      } else {
        toast.error('Failed to create sample courses');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Failed to create sample data');
    } finally {
      setCreatingData(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      // Fetch courses first with larger limit to get all courses
      const coursesResponse = await fetch('${process.env.REACT_APP_API_URL}/admin/courses?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let coursesData = null;
      if (coursesResponse.ok) {
        coursesData = await coursesResponse.json();
        if (coursesData.success && coursesData.data?.courses) {
          setCourses(coursesData.data.courses);
          console.log('Fetched courses for overview:', coursesData.data.courses.length);
        } else {
          console.warn('Invalid courses response format:', coursesData);
          setCourses([]);
        }
      } else {
        const errorText = await coursesResponse.text();
        console.error('Failed to fetch courses:', errorText);
        toast.error('Failed to fetch courses');
        setCourses([]);
      }

      // Fetch analytics
      const analyticsResponse = await fetch(`${process.env.REACT_APP_API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        console.log('Fetched analytics data:', analyticsData);
        
        if (analyticsData.success && coursesData?.data?.courses) {
          const courses = coursesData.data.courses;
          
          // Calculate category statistics
          const categoryCount: { [key: string]: number } = {};
          courses.forEach((course: Course) => {
            categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
          });
          
          const popularCategories = Object.entries(categoryCount)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Calculate real statistics from fetched data
          const activeCourses = courses.filter((c: Course) => c.isActive).length;
          const coursesWithMeetings = courses.filter((c: Course) => 
            c.meetLink || (c.liveSessions && c.liveSessions.length > 0)
          ).length;
          const totalLiveSessions = courses.reduce((sum: number, c: Course) => 
            sum + (c.liveSessions?.filter(session => session.isActive)?.length || 0), 0
          );

          const analytics: Analytics = {
            totalCourses: courses.length,
            totalStudents: analyticsData.data?.stats?.totalUsers || 0,
            totalRevenue: analyticsData.data?.stats?.totalRevenue || 0,
            activeCourses,
            coursesWithMeetings,
            totalLiveSessions,
            monthlyGrowth: analyticsData.data?.monthlyGrowth || 0,
            popularCategories
          };
          setAnalytics(analytics);
          console.log('Calculated analytics:', analytics);
        } else {
          // Fallback analytics calculation from courses only
          if (coursesData?.data?.courses) {
            const courses = coursesData.data.courses;
            const categoryCount: { [key: string]: number } = {};
            courses.forEach((course: Course) => {
              categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
            });
            
            const popularCategories = Object.entries(categoryCount)
              .map(([category, count]) => ({ category, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            const fallbackAnalytics: Analytics = {
              totalCourses: courses.length,
              totalStudents: 0,
              totalRevenue: 0,
              activeCourses: courses.filter((c: Course) => c.isActive).length,
              coursesWithMeetings: courses.filter((c: Course) => 
                c.meetLink || (c.liveSessions && c.liveSessions.length > 0)
              ).length,
              totalLiveSessions: courses.reduce((sum: number, c: Course) => 
                sum + (c.liveSessions?.filter(session => session.isActive)?.length || 0), 0
              ),
              monthlyGrowth: 0,
              popularCategories
            };
            setAnalytics(fallbackAnalytics);
            console.log('Using fallback analytics:', fallbackAnalytics);
          }
        }
      } else {
        const errorText = await analyticsResponse.text();
        console.error('Failed to fetch analytics:', errorText);
        // Continue without analytics data, we'll still show course data
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCourses = () => {
    let filtered = courses;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    // Sort courses
    switch (sortBy) {
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'enrollment':
        filtered = filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getUniqueCategories = () => {
    return ['all', ...Array.from(new Set(courses.map(course => course.category)))];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalCourses || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {analytics?.activeCourses || 0} active courses
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalStudents || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              +{analytics?.monthlyGrowth || 0}% this month
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics?.totalRevenue || 0)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              From {courses.length} courses
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Live Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalLiveSessions || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {analytics?.coursesWithMeetings || 0} courses with meetings
            </span>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      {analytics?.popularCategories && analytics.popularCategories.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
          <div className="space-y-3">
            {analytics.popularCategories.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / analytics.totalCourses) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Course Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {getFilteredCourses().length} of {courses.length} courses
                {analytics && (
                  <span className="ml-2 text-green-600">
                    • {analytics.activeCourses} active
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Refresh Data'
                )}
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="enrollment">Most Enrolled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {getFilteredCourses().map(course => (
              <div key={course._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {course.imageURL ? (
                    <img 
                      src={course.imageURL} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Course+Image';
                      }}
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">{course.title}</h3>
                    <div className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      course.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{course.category}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Price:</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-green-600">{formatCurrency(course.price)}</span>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="text-gray-400 line-through text-xs">
                            {formatCurrency(course.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Enrolled:</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{course.enrollmentCount || 0} students</span>
                        {course.enrollmentCount > 50 && (
                          <span className="px-1 py-0.5 bg-green-100 text-green-600 rounded text-xs">Popular</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{course.duration || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Level:</span>
                      <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-600' :
                        course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                        course.level === 'Advanced' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {course.level || 'N/A'}
                      </span>
                    </div>
                    
                    {course.rating && course.rating > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{course.rating.toFixed(1)}</span>
                          <div className="flex text-yellow-400">
                            {'★'.repeat(Math.floor(course.rating))}
                            {'☆'.repeat(5 - Math.floor(course.rating))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {course.meetLink && (
                      <div className="flex items-center text-xs text-blue-600">
                        <Video className="h-3 w-3 mr-1" />
                        <span>Live classes available</span>
                      </div>
                    )}
                    
                    {course.liveSessions && course.liveSessions.length > 0 && (
                      <div className="flex items-center text-xs text-purple-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{course.liveSessions.length} scheduled sessions</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {getFilteredCourses().length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">
                {courses.length === 0 
                  ? "Get started by creating your first course or adding sample data"
                  : "No courses match your current filters"}
              </p>
              {courses.length === 0 && (
                <button
                  onClick={createSampleData}
                  disabled={creatingData}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingData ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Sample Data...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Sample Data
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
