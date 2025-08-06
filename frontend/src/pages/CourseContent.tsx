import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveSession {
  id: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  meetLink: string;
  status: 'scheduled' | 'live' | 'completed';
}

const CourseContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourseContent = useCallback(async () => {
    try {
      const response = await fetch(`https://iasdesk-educational-platform-2.onrender.com/api/courses/${id}`);
      const data = await response.json();
      
      if (data.success && data.data.course) {
        setCourse(data.data.course);
        
        const sessions: LiveSession[] = [];
        const today = new Date().toISOString().split('T')[0];
        
        // Add regular course meeting link if available
        if (data.data.course.meetLink) {
          sessions.push({
            id: 'regular-class',
            title: `${data.data.course.title} - Regular Class`,
            scheduledDate: today,
            scheduledTime: data.data.course.meetSchedule?.dailyTime || 'As scheduled',
            meetLink: data.data.course.meetLink,
            status: 'live'
          });
        }
        
        // Add live sessions scheduled by admin - FILTER OUT DEMO DATA
        if (data.data.course.liveSessions) {
          data.data.course.liveSessions.forEach((session: any, index: number) => {
            const sessionDate = new Date(session.date).toISOString().split('T')[0];
            
            // Filter out demo/test sessions
            const sessionTitle = session.title?.toLowerCase() || '';
            const isDemoSession = sessionTitle.includes('demo') || 
                                sessionTitle.includes('test') || 
                                sessionTitle === 'english' ||
                                sessionTitle.length < 5;
            
            // Show sessions for today and upcoming days, but exclude demo sessions
            if (session.isActive && new Date(session.date) >= new Date(today) && !isDemoSession) {
              sessions.push({
                id: `session-${index}`,
                title: session.title,
                scheduledDate: sessionDate,
                scheduledTime: session.time,
                meetLink: session.meetLink,
                status: sessionDate === today ? 'live' : 'scheduled'
              });
            }
          });
        }
        
        setLiveSessions(sessions);
      } else {
        toast.error('Course not found');
        navigate('/my-courses');
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast.error('Failed to load course content');
      navigate('/my-courses');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to access course content');
      navigate('/courses');
      return;
    }

    const verifyEnrollmentAndPayment = async () => {
      try {
        setLoading(true);
        
        // Check backend for user's enrolled courses with payment verification
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const userData = await response.json();
        
        if (!userData.success || !userData.data.user) {
          toast.error('Failed to verify enrollment');
          navigate('/courses');
          return;
        }

        const user = userData.data.user;
        const enrolledCourse = user.enrolledCourses.find((enrollment: any) => 
          enrollment.courseId._id === id || enrollment.courseId === id
        );

        if (!enrolledCourse) {
          toast.error('You are not enrolled in this course. Please purchase the course to access content.');
          navigate('/courses');
          return;
        }

        if (!enrolledCourse.paymentId) {
          toast.error('Payment verification required. Please complete payment to access course content.');
          navigate('/courses');
          return;
        }

        // If we reach here, user has valid enrollment with payment
        // Now fetch course content
        await fetchCourseContent();
        
      } catch (error) {
        console.error('Error verifying enrollment:', error);
        toast.error('Failed to verify course access');
        navigate('/courses');
      }
    };

    verifyEnrollmentAndPayment();
  }, [id, isAuthenticated, authLoading, navigate, fetchCourseContent]);

  const joinLiveSession = (session: LiveSession) => {
    if (session.meetLink) {
      window.open(session.meetLink, '_blank');
      toast.success(`Joining ${session.title}...`);
    } else {
      toast.error('Meeting link not available');
    }
  };

  if (authLoading || loading || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Checking authentication...' : 'Loading course content...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/my-courses')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to My Courses
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Course Content</h1>
                <p className="text-sm text-gray-500">Access your live classes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Session Box */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-6">by IASDesk Expert Faculty</p>
            
            {liveSessions.length > 0 ? (
              <div className="space-y-6">
                {liveSessions.map((session) => (
                  <div key={session.id} className={`rounded-lg p-6 border ${
                    session.id === 'regular-class' 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      : session.status === 'live'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                      : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        session.id === 'regular-class'
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'live'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {session.id === 'regular-class' 
                          ? '🎓 REGULAR CLASS'
                          : session.status === 'live'
                          ? '🔴 LIVE CLASS'
                          : '📅 SCHEDULED CLASS'
                        }
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{session.title}</h3>
                    
                    <div className="flex items-center justify-center text-lg text-gray-700 mb-6">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        {session.id === 'regular-class' 
                          ? `Schedule: ${session.scheduledTime}`
                          : session.status === 'scheduled'
                          ? `Date: ${new Date(session.scheduledDate).toLocaleDateString()} at ${session.scheduledTime}`
                          : `Class Time: ${session.scheduledTime}`
                        }
                      </span>
                    </div>
                    
                    <button
                      onClick={() => joinLiveSession(session)}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                        session.id === 'regular-class'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                          : session.status === 'live'
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                      }`}
                    >
                      <ExternalLink className="h-5 w-5 mr-2 inline" />
                      {session.id === 'regular-class' 
                        ? 'Join Regular Class'
                        : session.status === 'live'
                        ? 'Join Live Class Now'
                        : 'Join Scheduled Class'
                      }
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8">
                <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Available</h3>
                <p className="text-gray-600 text-lg">
                  Classes will appear here when scheduled by your instructor.
                  <br />
                  <span className="text-sm">Check back later or contact support if you think this is an error.</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
