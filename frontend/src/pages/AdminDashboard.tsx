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
    // Mock data
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'UPSC Prelims Complete Course 2025',
        description: 'Comprehensive preparation for UPSC Civil Services Preliminary Examination',
        instructor: 'Dr. Rajesh Kumar',
        duration: '12 months',
        price: 15999,
        category: 'upsc',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        meetSchedule: 'Every Sunday 10:00 AM - 12:00 PM',
        isActive: true,
        difficulty: 'intermediate',
        thumbnail: '/api/placeholder/400/300',
        syllabus: ['Ancient History', 'Medieval History', 'Modern History', 'Geography', 'Polity', 'Economics'],
        features: ['Live Google Meet Sessions', 'One Year Full Access', 'Mobile & desktop access', 'Weekly Mock Tests'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-08-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Class 12 Physics Complete Course',
        description: 'Complete Physics course for Class 12 CBSE and competitive exams',
        instructor: 'Prof. Anita Sharma',
        duration: '8 months',
        price: 8999,
        category: 'school',
        meetLink: 'https://meet.google.com/xyz-uvwx-yz',
        meetSchedule: 'Every Tuesday & Thursday 4:00 PM - 6:00 PM',
        isActive: true,
        difficulty: 'intermediate',
        thumbnail: '/api/placeholder/400/300',
        syllabus: ['Electrostatics', 'Current Electricity', 'Magnetic Effects', 'Electromagnetic Induction', 'Optics', 'Modern Physics'],
        features: ['Animation Videos', 'Lab Simulations', 'Practice Problems', 'Board Exam Prep'],
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-08-01T00:00:00Z'
      }
    ];

    const mockMeetSessions: MeetSession[] = [
      {
        id: '1',
        courseId: '1',
        courseName: 'UPSC Prelims Complete Course 2025',
        meetLink: 'https://meet.google.com/upsc-live-session',
        scheduledDate: '2025-08-10',
        scheduledTime: '10:00',
        status: 'scheduled'
      },
      {
        id: '2',
        courseId: '2',
        courseName: 'Class 12 Physics Complete Course',
        meetLink: 'https://meet.google.com/physics-class',
        scheduledDate: '2025-08-08',
        scheduledTime: '16:00',
        status: 'live'
      }
    ];

    setCourses(mockCourses);
    setMeetSessions(mockMeetSessions);
  }, []);

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

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success('Course deleted successfully');
    }
  };

  const handleSaveCourse = (courseData: Partial<Course>) => {
    if (editingCourse) {
      // Update existing course
      setCourses(courses.map(c => 
        c.id === editingCourse.id 
          ? { ...c, ...courseData }
          : c
      ));
      toast.success('Course updated successfully');
    } else {
      // Create new course
      const newCourse: Course = {
        id: Date.now().toString(),
        title: courseData.title || '',
        description: courseData.description || '',
        instructor: courseData.instructor || '',
        duration: courseData.duration || '',
        price: courseData.price || 0,
        category: courseData.category || '',
        meetLink: courseData.meetLink || '',
        meetSchedule: courseData.meetSchedule || '',
        difficulty: courseData.difficulty || 'beginner',
        thumbnail: courseData.thumbnail || '/api/placeholder/400/300',
        syllabus: courseData.syllabus || [],
        features: courseData.features || [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCourses([...courses, newCourse]);
      toast.success('Course created successfully');
    }
    setShowCourseModal(false);
  };

  const handleCreateMeetSession = () => {
    setEditingMeet(null);
    setShowMeetModal(true);
  };

  const handleEditMeetSession = (session: MeetSession) => {
    setEditingMeet(session);
    setShowMeetModal(true);
  };

  const handleDeleteMeetSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this meet session?')) {
      setMeetSessions(meetSessions.filter(s => s.id !== sessionId));
      toast.success('Meet session deleted successfully');
    }
  };

  const handleSaveMeetSession = (sessionData: Partial<MeetSession>) => {
    if (editingMeet) {
      // Update existing session
      setMeetSessions(meetSessions.map(s => 
        s.id === editingMeet.id 
          ? { ...s, ...sessionData }
          : s
      ));
      toast.success('Meet session updated successfully');
    } else {
      // Create new session
      const newSession: MeetSession = {
        id: Date.now().toString(),
        courseId: sessionData.courseId || '',
        courseName: courses.find(c => c.id === sessionData.courseId)?.title || '',
        meetLink: sessionData.meetLink || '',
        scheduledDate: sessionData.scheduledDate || '',
        scheduledTime: sessionData.scheduledTime || '',
        status: 'scheduled'
      };
      setMeetSessions([...meetSessions, newSession]);
      toast.success('Meet session created successfully');
    }
    setShowMeetModal(false);
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
                  <option value="upsc">UPSC</option>
                  <option value="school">Class 5-12</option>
                  <option value="ssc">SSC</option>
                  <option value="banking">Banking</option>
                  <option value="state-psc">State PSC</option>
                  <option value="jee-neet">JEE & NEET</option>
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
