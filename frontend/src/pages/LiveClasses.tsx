import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Video, 
  Clock, 
  ExternalLink,
  BookOpen,
  Play,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tokenUtils } from '../utils/token';
import toast from 'react-hot-toast';

interface LiveClass {
  id: string;
  courseId: string;
  courseTitle: string;
  meetLink: string;
  scheduledTime: string;
  description: string;
  isActive: boolean;
  type: 'regular' | 'scheduled'; // Add type to distinguish between regular and scheduled sessions
  schedule?: string; // For regular classes
}

const LiveClasses: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLiveClasses();
    }
  }, [isAuthenticated]);

  const fetchLiveClasses = async () => {
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
      
      console.log('LiveClasses - User data from API:', userData); // Debug log
      
      if (!userData.success || !userData.data.user || !userData.data.user.enrolledCourses) {
        console.log('LiveClasses - No enrolled courses found');
        setLiveClasses([]);
        setLoading(false);
        return;
      }

      // Filter only courses with payment verification
      const validEnrollments = userData.data.user.enrolledCourses.filter((enrollment: any) => 
        enrollment.paymentId // Only show courses with valid payment
      );

      console.log('LiveClasses - Valid enrollments:', validEnrollments.length);

      const allLiveClasses: LiveClass[] = [];
      
      // Process each enrolled course
      validEnrollments.forEach((enrollment: any) => {
        const course = enrollment.courseId;
        console.log('LiveClasses - Processing course:', course?.title, {
          hasMeetLink: !!course?.meetLink,
          liveSessions: course?.liveSessions?.length || 0
        });
        
        // Add regular course meeting link if available
        if (course?.meetLink && course.meetLink.trim() !== '') {
          allLiveClasses.push({
            id: `regular-${course._id}`,
            courseId: course._id,
            courseTitle: course.title,
            meetLink: course.meetLink,
            scheduledTime: new Date().toISOString(), // Current time for regular classes
            description: 'Regular live class session',
            isActive: true,
            type: 'regular',
            schedule: course.meetSchedule?.dailyTime ? 
              `Daily at ${course.meetSchedule.dailyTime} (${course.meetSchedule.timezone || 'Asia/Kolkata'})` :
              'Regular live sessions available'
          });
        }

        // Add scheduled live sessions - FILTER OUT DEMO DATA
        if (course?.liveSessions && course.liveSessions.length > 0) {
          course.liveSessions.forEach((session: any) => {
            const sessionDate = new Date(session.date).toISOString().split('T')[0];
            
            // Show today's sessions and upcoming sessions within next 7 days
            const sessionDateTime = new Date(session.date);
            const now = new Date();
            const daysDiff = Math.ceil((sessionDateTime.getTime() - now.getTime()) / (1000 * 3600 * 24));
            
            // Filter out only inactive sessions
            if (daysDiff >= 0 && daysDiff <= 7 && session.isActive) {
              allLiveClasses.push({
                id: session._id || `session-${course._id}-${sessionDate}`,
                courseId: course._id,
                courseTitle: `${course.title} - Special Session`,
                meetLink: session.meetLink,
                scheduledTime: `${sessionDate}T${session.time}:00`,
                description: session.title || 'Live session',
                isActive: session.isActive,
                type: 'scheduled'
              });
            }
          });
        }
      });
      
      console.log('LiveClasses - Total live classes found:', allLiveClasses.length);
      console.log('LiveClasses - Live classes:', allLiveClasses.map(c => ({ 
        type: c.type, 
        title: c.courseTitle, 
        description: c.description 
      })));
      
      // Sort by type (regular first) and then by course title
      allLiveClasses.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'regular' ? -1 : 1;
        }
        return a.courseTitle.localeCompare(b.courseTitle);
      });
      
      setLiveClasses(allLiveClasses);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLiveClasses([]);
      toast.error('Failed to load live classes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLiveClasses();
    setRefreshing(false);
    toast.success('Live classes updated!');
  };

  const joinClass = (liveClass: LiveClass) => {
    if (liveClass.meetLink) {
      window.open(liveClass.meetLink, '_blank');
      toast.success(`Joining ${liveClass.courseTitle}...`);
    } else {
      toast.error('Meeting link not available');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Classes</h1>
              <p className="text-gray-600">Access live sessions and meeting links for your enrolled courses</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {liveClasses.length === 0 ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Live Classes Available</h3>
            <p className="text-gray-600 mb-6">
              No live sessions or meeting links found for your enrolled courses. Enroll in courses with live sessions to see them here.
            </p>
            <a
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {liveClasses.map((liveClass) => (
              <div
                key={liveClass.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                  liveClass.type === 'regular' 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-green-200 bg-green-50'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      liveClass.type === 'regular'
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>{liveClass.type === 'regular' ? 'REGULAR CLASS' : 'SCHEDULED SESSION'}</span>
                    </span>
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {liveClass.courseTitle}
                </h3>

                {/* Schedule */}
                <div className="flex items-center space-x-2 text-gray-600 mb-3">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {liveClass.type === 'regular' 
                      ? liveClass.schedule || 'Regular sessions available'
                      : formatTime(liveClass.scheduledTime)
                    }
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {liveClass.description}
                </p>

                {/* Action Button */}
                <div className="space-y-2">
                  <button
                    onClick={() => joinClass(liveClass)}
                    className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors font-medium text-white ${
                      liveClass.type === 'regular'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <Play className="h-4 w-4" />
                    <span>Join {liveClass.type === 'regular' ? 'Regular Class' : 'Live Session'}</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClasses;
