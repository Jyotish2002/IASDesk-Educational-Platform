import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  Save,
  X,
  Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tokenUtils } from '../utils/token';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  category: string;
  meetLink?: string;
  meetSchedule?: string;
  isActive: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  syllabus: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface MeetSession {
  id: string;
  courseId: string;
  courseName: string;
  meetLink: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'live' | 'completed';
}

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [meetSessions, setMeetSessions] = useState<MeetSession[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingMeet, setEditingMeet] = useState<MeetSession | null>(null);

  useEffect(() => {
    loadCourses();
    loadMeetSessions();
  }, []);

  const loadCourses = async () => {
    try {
      const token = tokenUtils.getAdminToken();
      const response = await fetch('http://localhost:5000/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform backend data to frontend format
          const transformedCourses = data.data.courses.map((course: any) => ({
            id: course._id,
            title: course.title,
            description: course.description,
            instructor: course.instructor?.name || 'Expert Instructor',
            duration: course.duration || 'N/A',
            price: course.price,
            category: course.category,
            meetLink: course.meetLink || '',
            meetSchedule: course.meetSchedule?.dailyTime ? 
              `Daily at ${course.meetSchedule.dailyTime} (${course.meetSchedule.timezone})` : 
              'No schedule set',
            isActive: course.isActive,
            difficulty: course.level?.toLowerCase() || 'beginner',
            thumbnail: course.imageURL || '/api/placeholder/400/300',
            syllabus: course.curriculum?.map((item: any) => item.title) || [],
            features: course.features || [],
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
          }));
          setCourses(transformedCourses);
        }
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Error loading courses');
    }
  };

  const loadMeetSessions = async () => {
    try {
      const token = tokenUtils.getAdminToken();
      const response = await fetch('http://localhost:5000/api/admin/meeting-links', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform backend data to frontend format
          const allMeetSessions: MeetSession[] = data.data.liveSessions.map((session: any) => ({
            id: session.sessionId || `${session.courseId}-${session.scheduledDate}`,
            courseId: session.courseId,
            courseName: session.courseTitle,
            meetLink: session.meetLink,
            scheduledDate: new Date(session.scheduledDate).toISOString().split('T')[0],
            scheduledTime: session.scheduledTime,
            status: new Date(session.scheduledDate) < new Date() ? 'completed' : 'scheduled'
          }));
          
          setMeetSessions(allMeetSessions);
        }
      }
    } catch (error) {
      console.error('Error loading meet sessions:', error);
      toast.error('Error loading meet sessions');
    }
  };

  // Check if user is admin
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const token = tokenUtils.getAdminToken();
        const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            toast.success('Course deleted successfully');
            loadCourses(); // Reload courses from backend
          } else {
            toast.error(data.message || 'Failed to delete course');
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to delete course');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Error deleting course');
      }
    }
  };

  const handleSaveCourse = async (courseData: Partial<Course>) => {
    try {
      const token = tokenUtils.getAdminToken();
      const url = editingCourse 
        ? `http://localhost:5000/api/admin/courses/${editingCourse.id}`
        : 'http://localhost:5000/api/admin/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';
      
      // Transform frontend data to backend format
      const backendData = {
        title: courseData.title,
        description: courseData.description,
        imageURL: courseData.thumbnail || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80',
        price: courseData.price,
        category: courseData.category,
        level: courseData.difficulty ? 
          courseData.difficulty.charAt(0).toUpperCase() + courseData.difficulty.slice(1) : 
          'Beginner',
        features: courseData.features,
        curriculum: courseData.syllabus?.map(item => ({ title: item, topics: [] })),
        instructor: {
          name: courseData.instructor,
          bio: '',
          image: ''
        },
        duration: courseData.duration,
        ...(courseData.meetLink && { meetLink: courseData.meetLink }),
        ...(courseData.meetSchedule && {
          meetSchedule: {
            dailyTime: courseData.meetSchedule,
            timezone: 'Asia/Kolkata',
            isActive: true
          }
        })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(editingCourse ? 'Course updated successfully' : 'Course created successfully');
          loadCourses(); // Reload courses from backend
          setShowCourseModal(false);
        } else {
          toast.error(data.message || 'Failed to save course');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Error saving course');
    }
  };

  const handleCreateMeetSession = () => {
    setEditingMeet(null);
    setShowMeetModal(true);
  };

  const handleEditMeetSession = (session: MeetSession) => {
    setEditingMeet(session);
    setShowMeetModal(true);
  };

  const handleDeleteMeetSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this meet session?')) {
      try {
        // For now, show a message as deleting individual live sessions requires backend implementation
        toast('Individual session deletion not yet implemented. Please edit the course to manage sessions.');
        // Remove from frontend state temporarily
        setMeetSessions(meetSessions.filter(s => s.id !== sessionId));
      } catch (error) {
        console.error('Error deleting meet session:', error);
        toast.error('Error deleting meet session');
      }
    }
  };

  const handleSaveMeetSession = async (sessionData: Partial<MeetSession>) => {
    try {
      const token = tokenUtils.getAdminToken();
      
      if (editingMeet) {
        // For editing, we need to update the course's liveSessions array
        toast('Editing existing sessions not yet implemented. Please delete and create new.');
        setShowMeetModal(false);
        return;
      } else {
        // Create new live session
        const url = `http://localhost:5000/api/admin/courses/${sessionData.courseId}/live-session`;
        
        const backendData = {
          date: sessionData.scheduledDate,
          time: sessionData.scheduledTime,
          meetLink: sessionData.meetLink,
          title: `Live Session - ${new Date(sessionData.scheduledDate || '').toLocaleDateString()}`
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backendData)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            toast.success('Live session scheduled successfully');
            loadMeetSessions(); // Reload meet sessions
            setShowMeetModal(false);
          } else {
            toast.error(data.message || 'Failed to schedule session');
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to schedule session');
        }
      }
    } catch (error) {
      console.error('Error saving meet session:', error);
      toast.error('Error saving meet session');
    }
  };

  const startMeetSession = (sessionId: string) => {
    const session = meetSessions.find(s => s.id === sessionId);
    if (session) {
      window.open(session.meetLink, '_blank');
      // Update status to live
      setMeetSessions(meetSessions.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'live' as const }
          : s
      ));
      toast.success('Google Meet session started');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage courses and Google Meet sessions</p>
            </div>
            <div className="text-sm text-gray-500">
              Welcome, {user?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab('meets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'meets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Google Meet Sessions
            </button>
            <button
              onClick={() => setActiveTab('meeting-links')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'meeting-links'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Meeting Links
            </button>
          </nav>
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
              <button
                onClick={handleCreateCourse}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </button>
            </div>

            <div className="grid gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">{course.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{course.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Instructor:</span>
                          <p className="font-medium">{course.instructor}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">{course.duration}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <p className="font-medium">₹{course.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <p className="font-medium">{course.category.toUpperCase()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Difficulty:</span>
                          <p className={`font-medium capitalize ${
                            course.difficulty === 'beginner' ? 'text-green-600' :
                            course.difficulty === 'intermediate' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {course.difficulty}
                          </p>
                        </div>
                      </div>

                      {/* Syllabus */}
                      {course.syllabus && course.syllabus.length > 0 && (
                        <div className="mb-3">
                          <span className="text-gray-500 text-sm">Syllabus:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {course.syllabus.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {item}
                              </span>
                            ))}
                            {course.syllabus.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{course.syllabus.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      {course.features && course.features.length > 0 && (
                        <div className="mb-3">
                          <span className="text-gray-500 text-sm">Features:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {course.features.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {item}
                              </span>
                            ))}
                            {course.features.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{course.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {course.meetLink && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-blue-800 mb-1">
                            <Video className="h-4 w-4 mr-2" />
                            <span className="font-medium">Google Meet Link</span>
                          </div>
                          <p className="text-sm text-blue-600">{course.meetSchedule}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google Meet Sessions Tab */}
        {activeTab === 'meets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Google Meet Sessions</h2>
              <button
                onClick={handleCreateMeetSession}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </button>
            </div>

            <div className="grid gap-6">
              {meetSessions.map((session) => (
                <div key={session.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">{session.courseName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'live' 
                            ? 'bg-green-100 text-green-800' 
                            : session.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-medium">{new Date(session.scheduledDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <p className="font-medium">{session.scheduledTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <p className="font-medium">{session.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => startMeetSession(session.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Start Meet
                        </button>
                        <a
                          href={session.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          View Link
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditMeetSession(session)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeetSession(session.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All Meeting Links Tab */}
      {activeTab === 'meeting-links' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Meeting Links</h2>
              <p className="text-gray-600">Overview of all Google Meet links you've provided</p>
            </div>
          </div>

          {/* Course Meeting Links */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Regular Meeting Links</h3>
              <div className="grid gap-4">
                {courses.filter(course => course.meetLink).map((course) => (
                  <div key={course.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{course.meetSchedule}</p>
                        <div className="flex items-center space-x-4">
                          <a
                            href={course.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            {course.meetLink}
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(course.meetLink || '');
                              toast.success('Link copied to clipboard!');
                            }}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
                {courses.filter(course => course.meetLink).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No regular meeting links set up for courses yet.</p>
                    <p className="text-sm">Edit a course to add a regular Google Meet link.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Session Meeting Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Session Meeting Links</h3>
              <div className="grid gap-4">
                {meetSessions.map((session) => (
                  <div key={session.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{session.courseName}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(session.scheduledDate).toLocaleDateString()} at {session.scheduledTime}
                        </p>
                        <div className="flex items-center space-x-4">
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            {session.meetLink}
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(session.meetLink);
                              toast.success('Link copied to clipboard!');
                            }}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'live' 
                          ? 'bg-green-100 text-green-800' 
                          : session.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {meetSessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No live session meeting links scheduled yet.</p>
                    <p className="text-sm">Go to "Google Meet Sessions" tab to schedule sessions.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Meeting Links Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{courses.filter(c => c.meetLink).length}</div>
                  <div className="text-sm text-gray-600">Regular Course Links</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{meetSessions.length}</div>
                  <div className="text-sm text-gray-600">Live Session Links</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {courses.filter(c => c.meetLink).length + meetSessions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Meeting Links</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <CourseModal
          course={editingCourse}
          onSave={handleSaveCourse}
          onClose={() => setShowCourseModal(false)}
        />
      )}

      {/* Meet Session Modal */}
      {showMeetModal && (
        <MeetSessionModal
          session={editingMeet}
          courses={courses}
          onSave={handleSaveMeetSession}
          onClose={() => setShowMeetModal(false)}
        />
      )}
    </div>
  );
};

// Course Modal Component
const CourseModal: React.FC<{
  course: Course | null;
  onSave: (courseData: Partial<Course>) => void;
  onClose: () => void;
}> = ({ course, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    instructor: course?.instructor || '',
    duration: course?.duration || '',
    price: course?.price || 0,
    category: course?.category || '',
    difficulty: course?.difficulty || 'beginner',
    meetLink: course?.meetLink || '',
    meetSchedule: course?.meetSchedule || '',
    thumbnail: course?.thumbnail || '',
    syllabus: course?.syllabus || [],
    features: course?.features || []
  });

  const [syllabusInput, setSyllabusInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
  };

  const addSyllabusItem = () => {
    if (syllabusInput.trim()) {
      setFormData({
        ...formData,
        syllabus: [...formData.syllabus, syllabusInput.trim()]
      });
      setSyllabusInput('');
    }
  };

  const removeSyllabusItem = (index: number) => {
    setFormData({
      ...formData,
      syllabus: formData.syllabus.filter((_, i) => i !== index)
    });
  };

  const addFeatureItem = () => {
    if (featuresInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featuresInput.trim()]
      });
      setFeaturesInput('');
    }
  };

  const removeFeatureItem = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {course ? 'Edit Course' : 'Create New Course'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="UPSC">UPSC</option>
                  <option value="UPSC Prelims">UPSC Prelims</option>
                  <option value="UPSC Mains">UPSC Mains</option>
                  <option value="UPSC Interview">UPSC Interview</option>
                  <option value="UPSC Optional">UPSC Optional</option>
                  <option value="Class 5-12">Class 5-12</option>
                  <option value="Class 5-8">Class 5-8</option>
                  <option value="Class 9-10">Class 9-10</option>
                  <option value="Class 11-12 Science">Class 11-12 Science</option>
                  <option value="Class 11-12 Commerce">Class 11-12 Commerce</option>
                  <option value="SSC">SSC</option>
                  <option value="Banking">Banking</option>
                  <option value="State PSC">State PSC</option>
                  <option value="JEE & NEET">JEE & NEET</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter instructor name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 6 months"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter course price"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Meet Link
                </label>
                <input
                  type="url"
                  value={formData.meetLink}
                  onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder="Enter detailed course description"
                required
              />
            </div>

            {/* Meet Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Class Schedule
              </label>
              <input
                type="text"
                value={formData.meetSchedule}
                onChange={(e) => setFormData({ ...formData, meetSchedule: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Every Sunday 10:00 AM - 12:00 PM"
              />
            </div>

            {/* Syllabus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Syllabus
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={syllabusInput}
                  onChange={(e) => setSyllabusInput(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add syllabus topic"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSyllabusItem())}
                />
                <button
                  type="button"
                  onClick={addSyllabusItem}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.syllabus.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeSyllabusItem(index)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Features
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add course feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeatureItem())}
                />
                <button
                  type="button"
                  onClick={addFeatureItem}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeFeatureItem(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {course ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Meet Session Modal Component
const MeetSessionModal: React.FC<{
  session: MeetSession | null;
  courses: Course[];
  onSave: (sessionData: Partial<MeetSession>) => void;
  onClose: () => void;
}> = ({ session, courses, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    courseId: session?.courseId || '',
    meetLink: session?.meetLink || '',
    scheduledDate: session?.scheduledDate || '',
    scheduledTime: session?.scheduledTime || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {session ? 'Edit Meet Session' : 'Schedule New Session'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Meet Link
              </label>
              <input
                type="url"
                value={formData.meetLink}
                onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://meet.google.com/..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Time
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {session ? 'Update Session' : 'Schedule Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
