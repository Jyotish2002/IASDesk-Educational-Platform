import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  Video, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  Lock,
  ArrowLeft,
  Calendar,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  resources?: CourseResource[];
}

interface CourseResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
  size?: string;
}

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('modules');
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);

  useEffect(() => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      toast.error('Please login to access course content');
      navigate('/courses');
      return;
    }

    // Check if user is enrolled in this course
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const isEnrolledInCourse = enrolledCourses.includes(id);
    
    if (!isEnrolledInCourse) {
      toast.error('You are not enrolled in this course');
      navigate('/courses');
      return;
    }

    // Mock course data
    const mockCourse = {
      id: id,
      title: id === '1' ? 'UPSC Prelims Complete Course 2025' : 'Class 12 Physics Complete Course',
      instructor: id === '1' ? 'Dr. Rajesh Kumar' : 'Prof. Anita Sharma',
      description: id === '1' 
        ? 'Comprehensive preparation for UPSC Civil Services Preliminary Examination'
        : 'Complete Physics course for Class 12 CBSE and competitive exams',
      totalModules: 24,
      completedModules: 8,
      progress: 33
    };

    const mockModules: CourseModule[] = [
      {
        id: '1',
        title: 'Introduction to UPSC Civil Services',
        description: 'Overview of the UPSC examination pattern and strategy',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '45 mins',
        isCompleted: true,
        isLocked: false,
        resources: [
          {
            id: '1',
            title: 'UPSC Syllabus 2025',
            type: 'pdf',
            url: '/resources/upsc-syllabus.pdf',
            size: '2.3 MB'
          },
          {
            id: '2',
            title: 'Strategy Guide',
            type: 'pdf',
            url: '/resources/strategy-guide.pdf',
            size: '1.8 MB'
          }
        ]
      },
      {
        id: '2',
        title: 'Indian History - Ancient Period',
        description: 'Comprehensive coverage of ancient Indian history',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '60 mins',
        isCompleted: true,
        isLocked: false,
        resources: [
          {
            id: '3',
            title: 'Ancient History Notes',
            type: 'pdf',
            url: '/resources/ancient-history.pdf',
            size: '3.2 MB'
          }
        ]
      },
      {
        id: '3',
        title: 'Indian History - Medieval Period',
        description: 'Medieval Indian history and important dynasties',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '55 mins',
        isCompleted: false,
        isLocked: false
      },
      {
        id: '4',
        title: 'Indian History - Modern Period',
        description: 'Modern Indian history and freedom struggle',
        duration: '50 mins',
        isCompleted: false,
        isLocked: true
      }
    ];

    const mockLiveSessions: LiveSession[] = [
      {
        id: '1',
        title: 'Weekly Doubt Clearing Session',
        scheduledDate: '2025-08-10',
        scheduledTime: '10:00',
        meetLink: 'https://meet.google.com/upsc-doubt-session',
        status: 'scheduled'
      },
      {
        id: '2',
        title: 'Mock Test Discussion',
        scheduledDate: '2025-08-08',
        scheduledTime: '16:00',
        meetLink: 'https://meet.google.com/mock-test-discussion',
        status: 'live'
      },
      {
        id: '3',
        title: 'Current Affairs Update',
        scheduledDate: '2025-08-05',
        scheduledTime: '18:00',
        meetLink: 'https://meet.google.com/current-affairs',
        status: 'completed'
      }
    ];

    setCourse(mockCourse);
    setModules(mockModules);
    setLiveSessions(mockLiveSessions);
    setSelectedModule(mockModules[0]);
  }, [id, navigate, isAuthenticated]);

  // Component renders after authentication checks in useEffect
  const handleModuleSelect = (module: CourseModule) => {
    if (module.isLocked) {
      toast.error('Complete previous modules to unlock this content');
      return;
    }
    setSelectedModule(module);
  };

  const markModuleComplete = (moduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, isCompleted: true }
        : module
    ));
    toast.success('Module marked as completed!');
  };

  const joinLiveSession = (meetLink: string) => {
    window.open(meetLink, '_blank');
    toast.success('Joining Google Meet session...');
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/courses')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">by {course.instructor}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {course.completedModules}/{course.totalModules}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Course Modules */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('modules')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'modules'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Modules
                  </button>
                  <button
                    onClick={() => setActiveTab('live')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'live'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Live Sessions
                  </button>
                </nav>
              </div>

              {/* Modules List */}
              {activeTab === 'modules' && (
                <div className="p-4 max-h-96 overflow-y-auto">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      onClick={() => handleModuleSelect(module)}
                      className={`p-3 rounded-lg mb-3 cursor-pointer transition-colors ${
                        selectedModule?.id === module.id
                          ? 'bg-primary-50 border-primary-200'
                          : 'hover:bg-gray-50'
                      } ${module.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          {module.isLocked ? (
                            <Lock className="h-4 w-4 text-gray-400" />
                          ) : module.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Play className="h-4 w-4 text-primary-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {index + 1}. {module.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1">{module.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {module.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Sessions List */}
              {activeTab === 'live' && (
                <div className="p-4 max-h-96 overflow-y-auto">
                  {liveSessions.map((session) => (
                    <div key={session.id} className="p-3 rounded-lg mb-3 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {session.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-600 mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(session.scheduledDate).toLocaleDateString()} at {session.scheduledTime}
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
                        {session.status !== 'completed' && (
                          <button
                            onClick={() => joinLiveSession(session.meetLink)}
                            className="ml-2 p-1 text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedModule && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Video Player */}
                {selectedModule.videoUrl && (
                  <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                    <iframe
                      src={selectedModule.videoUrl}
                      title={selectedModule.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Module Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedModule.title}
                      </h2>
                      <p className="text-gray-600">{selectedModule.description}</p>
                    </div>
                    {!selectedModule.isCompleted && selectedModule.videoUrl && (
                      <button
                        onClick={() => markModuleComplete(selectedModule.id)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </button>
                    )}
                  </div>

                  {/* Module Resources */}
                  {selectedModule.resources && selectedModule.resources.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources</h3>
                      <div className="grid gap-3">
                        {selectedModule.resources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{resource.title}</h4>
                                {resource.size && (
                                  <p className="text-xs text-gray-500">{resource.size}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => window.open(resource.url, '_blank')}
                              className="text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Video Available */}
                  {!selectedModule.videoUrl && (
                    <div className="text-center py-12">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                      <p className="text-gray-600">This module will be available soon. Stay tuned!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
