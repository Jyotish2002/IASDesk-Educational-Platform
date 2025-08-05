import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Video, 
  Clock, 
  Save, 
  Trash2, 
  Plus,
  AlertCircle,
  BookOpen,
  Users,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  title: string;
  enrollmentCount: number;
}

interface LiveClassSchedule {
  id: string;
  courseId: string;
  courseTitle: string;
  date: string;
  time: string;
  meetLink: string;
  description: string;
  isActive: boolean;
}

const LiveClassManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<LiveClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    courseId: '',
    date: '',
    time: '19:00', // Default to 7 PM
    meetLink: '',
    description: '',
  });

  useEffect(() => {
    fetchCourses();
    loadSchedules();
  }, []);

  const fetchCourses = async () => {
    try {
      // Get admin token from localStorage (set during admin login)
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token:', adminToken); // Debug log
      
      const response = await fetch('/api/courses', {
        headers: {
          'Content-Type': 'application/json',
          // Use the admin token from localStorage if available, otherwise use fallback
          'x-admin-token': adminToken || 'admin-authenticated',
        },
      });

      console.log('Courses API response status:', response.status); // Debug log

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourses(data.data.courses);
          console.log('Courses loaded successfully:', data.data.courses.length); // Debug log
        }
      } else {
        const errorData = await response.json();
        console.log('API failed with error:', errorData); // Debug log
        // Mock data for demo
        setCourses([
          { _id: '1', title: 'UPSC Prelims Complete Course 2025', enrollmentCount: 150 },
          { _id: '2', title: 'Class 12 Physics Complete Course', enrollmentCount: 89 },
          { _id: '3', title: 'SSC CGL Preparation Course', enrollmentCount: 203 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Mock data for demo
      setCourses([
        { _id: '1', title: 'UPSC Prelims Complete Course 2025', enrollmentCount: 150 },
        { _id: '2', title: 'Class 12 Physics Complete Course', enrollmentCount: 89 },
        { _id: '3', title: 'SSC CGL Preparation Course', enrollmentCount: 203 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = () => {
    // Load from localStorage for demo
    const saved = localStorage.getItem('liveClassSchedules');
    if (saved) {
      setSchedules(JSON.parse(saved));
    } else {
      // Generate some demo schedules
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const demoSchedules: LiveClassSchedule[] = [
        {
          id: '1',
          courseId: '1',
          courseTitle: 'UPSC Prelims Complete Course 2025',
          date: today.toISOString().split('T')[0],
          time: '19:00',
          meetLink: 'https://meet.google.com/abc-defg-hij',
          description: 'Daily live session - Current Affairs and Mock Test Discussion',
          isActive: true,
        },
        {
          id: '2',
          courseId: '1',
          courseTitle: 'UPSC Prelims Complete Course 2025',
          date: tomorrow.toISOString().split('T')[0],
          time: '19:00',
          meetLink: 'https://meet.google.com/xyz-uvwx-123',
          description: 'Tomorrow\'s session - Indian Polity and Constitution',
          isActive: false,
        },
      ];
      
      setSchedules(demoSchedules);
      localStorage.setItem('liveClassSchedules', JSON.stringify(demoSchedules));
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.courseId || !newSchedule.date || !newSchedule.meetLink) {
      toast.error('Please fill all required fields');
      return;
    }

    const course = courses.find(c => c._id === newSchedule.courseId);
    if (!course) {
      toast.error('Invalid course selected');
      return;
    }

    try {
      // Try to save to backend first
      const adminToken = localStorage.getItem('adminToken');
      console.log('Saving live session with admin token:', adminToken);
      
      const response = await fetch(`http://localhost:5000/api/courses/${newSchedule.courseId}/live-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated',
        },
        body: JSON.stringify({
          date: newSchedule.date,
          time: newSchedule.time,
          meetLink: newSchedule.meetLink,
          title: newSchedule.description || `Live session for ${course.title}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Live session saved to backend:', data);
        toast.success('Live session scheduled successfully!');
      } else {
        const errorData = await response.json();
        console.log('Backend save failed:', errorData);
        toast.error(`Failed to save: ${errorData.message || 'Unknown error'}`);
        // Still save locally for demo purposes
      }
    } catch (error) {
      console.error('Error saving live session:', error);
      toast.error('Failed to save live session to server');
      // Still save locally for demo purposes
    }

    // Always save locally for demo/offline purposes
    const schedule: LiveClassSchedule = {
      id: Date.now().toString(),
      courseId: newSchedule.courseId,
      courseTitle: course.title,
      date: newSchedule.date,
      time: newSchedule.time,
      meetLink: newSchedule.meetLink,
      description: newSchedule.description || `Live session for ${course.title}`,
      isActive: new Date(`${newSchedule.date}T${newSchedule.time}`) <= new Date(),
    };

    const updatedSchedules = [...schedules, schedule];
    setSchedules(updatedSchedules);
    localStorage.setItem('liveClassSchedules', JSON.stringify(updatedSchedules));

    // Reset form
    setNewSchedule({
      courseId: '',
      date: '',
      time: '19:00',
      meetLink: '',
      description: '',
    });

    toast.success('Live class scheduled successfully!');
  };

  const handleDeleteSchedule = (id: string) => {
    const updatedSchedules = schedules.filter(s => s.id !== id);
    setSchedules(updatedSchedules);
    localStorage.setItem('liveClassSchedules', JSON.stringify(updatedSchedules));
    toast.success('Schedule deleted successfully!');
  };

  const handleSaveSchedules = async () => {
    setSaving(true);
    
    try {
      // In a real implementation, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      localStorage.setItem('liveClassSchedules', JSON.stringify(schedules));
      toast.success('All schedules saved successfully!');
    } catch (error) {
      toast.error('Failed to save schedules');
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isClassToday = (date: string) => {
    const classDate = new Date(date);
    const today = new Date();
    return classDate.toDateString() === today.toDateString();
  };

  const isClassLive = (date: string, time: string) => {
    const now = new Date();
    const classTime = new Date(`${date}T${time}`);
    const endTime = new Date(classTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    return now >= classTime && now <= endTime;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Class Manager</h2>
          <p className="text-gray-600">Schedule and manage daily Google Meet sessions for your courses</p>
        </div>
        <button
          onClick={handleSaveSchedules}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </div>

      {/* Add New Schedule Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Live Class</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={newSchedule.courseId}
              onChange={(e) => setNewSchedule({ ...newSchedule, courseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newSchedule.date}
              onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={newSchedule.time}
              onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Meet Link</label>
            <input
              type="url"
              value={newSchedule.meetLink}
              onChange={(e) => setNewSchedule({ ...newSchedule, meetLink: e.target.value })}
              placeholder="https://meet.google.com/xxx-xxx-xxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <input
            type="text"
            value={newSchedule.description}
            onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
            placeholder="Brief description of the session"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleAddSchedule}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Scheduled Classes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Scheduled Live Classes</h3>
        </div>

        {schedules.length === 0 ? (
          <div className="p-8 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No classes scheduled</h4>
            <p className="text-gray-600">Start by scheduling your first live class above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {schedules
              .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
              .map((schedule) => (
                <div key={schedule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{schedule.courseTitle}</h4>
                        
                        {isClassLive(schedule.date, schedule.time) ? (
                          <span className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span>LIVE NOW</span>
                          </span>
                        ) : isClassToday(schedule.date) ? (
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            TODAY
                          </span>
                        ) : (
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            UPCOMING
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(schedule.date, schedule.time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{courses.find(c => c._id === schedule.courseId)?.enrollmentCount || 0} enrolled</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{schedule.description}</p>

                      <div className="flex items-center space-x-3">
                        <a
                          href={schedule.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                        >
                          <Video className="h-4 w-4" />
                          <span>Google Meet Link</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-yellow-800 font-medium">Demo Mode</h4>
            <p className="text-yellow-700 text-sm mt-1">
              Schedules are stored locally for demonstration. In production, these would be saved to your database and students would see them in their Live Classes page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClassManager;
