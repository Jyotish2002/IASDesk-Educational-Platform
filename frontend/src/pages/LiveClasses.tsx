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
import toast from 'react-hot-toast';

interface LiveClass {
  id: string;
  courseId: string;
  courseTitle: string;
  meetLink: string;
  scheduledTime: string;
  description: string;
  isActive: boolean;
}

const LiveClasses: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchLiveClasses();
    };
    fetchData();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      
      // Get enrolled courses from localStorage
      const enrolledCourses = localStorage.getItem('enrolledCourses');
      if (!enrolledCourses) {
        setLiveClasses([]);
        setLoading(false);
        return;
      }

      const courseIds = JSON.parse(enrolledCourses);
      const todayClasses: LiveClass[] = [];
      
      // Fetch live sessions for each enrolled course
      for (const courseId of courseIds) {
        try {
          const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);
          const data = await response.json();
          
          if (data.success && data.data.course) {
            const course = data.data.course;
            const today = new Date().toISOString().split('T')[0];
            
            // Only add today's live sessions
            if (course.liveSessions) {
              course.liveSessions.forEach((session: any) => {
                // Convert session date to YYYY-MM-DD format for comparison
                const sessionDate = new Date(session.date).toISOString().split('T')[0];
                
                if (sessionDate === today) {
                  todayClasses.push({
                    id: session._id,
                    courseId: courseId,
                    courseTitle: `${course.title} - Live Session`,
                    meetLink: session.meetLink,
                    scheduledTime: `${sessionDate}T${session.time}:00`,
                    description: session.title,
                    isActive: true // Since it's scheduled for today
                  });
                }
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching course ${courseId}:`, error);
        }
      }
      
      setLiveClasses(todayClasses);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLiveClasses([]);
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Today's Live Classes</h1>
              <p className="text-gray-600">Join today's live sessions for your enrolled courses</p>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Live Classes Today</h3>
            <p className="text-gray-600 mb-6">
              No live sessions scheduled for today. Check back tomorrow or enroll in more courses.
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
                className="bg-white rounded-xl shadow-sm border-2 border-red-200 bg-red-50 p-6 transition-all"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE TODAY</span>
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
                  <span className="text-sm">{formatTime(liveClass.scheduledTime)}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {liveClass.description}
                </p>

                {/* Action Button */}
                <div className="space-y-2">
                  <button
                    onClick={() => joinClass(liveClass)}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Play className="h-4 w-4" />
                    <span>Join Live Class</span>
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
