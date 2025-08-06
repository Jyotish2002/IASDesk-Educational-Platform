import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Video, 
  Save, 
  Trash2, 
  Plus,
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
    const initializeData = async () => {
      await fetchCourses();
      await loadSchedules();
    };
    initializeData();
  }, []);

  const fetchCourses = async () => {https://iasdesk-educational-platform-2.onrender.com
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/admin/courses', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.courses) {
          setCourses(data.data.courses);
          console.log('Courses loaded successfully:', data.data.courses.length);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/admin/meeting-links', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.liveSessions) {
          // Transform backend data to frontend format
          const transformedSchedules: LiveClassSchedule[] = data.data.liveSessions.map((session: any) => ({
            id: session.sessionId, // This is the MongoDB _id of the live session
            courseId: session.courseId,
            courseTitle: session.courseTitle,
            date: new Date(session.scheduledDate).toISOString().split('T')[0],
            time: session.scheduledTime,
            meetLink: session.meetLink,
            description: session.sessionTitle || 'Live session',
            isActive: session.isActive
          }));
          
          setSchedules(transformedSchedules);
          console.log('Live sessions loaded:', transformedSchedules.length);
        } else {
          setSchedules([]);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Failed to load live sessions');
      setSchedules([]);
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
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`https://iasdesk-educational-platform-2.onrender.com/api/admin/courses/${newSchedule.courseId}/live-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        
        // Reset form
        setNewSchedule({
          courseId: '',
          date: '',
          time: '19:00',
          meetLink: '',
          description: '',
        });
        
        // Reload schedules to show the new one
        await loadSchedules();
      } else {
        const errorData = await response.json();
        console.log('Backend save failed:', errorData);
        toast.error(`Failed to save: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving live session:', error);
      toast.error('Failed to save live session to server');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this live session? This action cannot be undone.')) {
      return;
    }

    try {
      // Find the schedule to get course ID and session ID
      const schedule = schedules.find(s => s.id === id);
      if (!schedule) {
        toast.error('Session not found');
        return;
      }

      console.log('Attempting to delete session:', { sessionId: id, courseId: schedule.courseId });

      // Make API call to delete the session from backend
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`https://iasdesk-educational-platform-2.onrender.com/api/admin/courses/${schedule.courseId}/live-session/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      console.log('Delete response:', responseData);

      if (response.ok && responseData.success) {
        console.log('Live session deleted from backend successfully');
        
        // Remove from local state immediately for better UX
        const updatedSchedules = schedules.filter(s => s.id !== id);
        setSchedules(updatedSchedules);
        
        toast.success('Live session deleted successfully!');
        
        // Force reload data to ensure consistency
        await loadSchedules();
      } else {
        console.error('Backend delete failed:', responseData);
        toast.error(`Failed to delete: ${responseData.message || 'Session may be corrupted. Try force delete.'}`);
        
        // Offer force delete option
        if (window.confirm('Regular delete failed. Would you like to try force delete? This will remove the session from frontend and refresh data.')) {
          const updatedSchedules = schedules.filter(s => s.id !== id);
          setSchedules(updatedSchedules);
          await loadSchedules();
          toast.success('Session removed from display. If it reappears, there may be a database issue.');
        }
      }
    } catch (error) {
      console.error('Error deleting live session:', error);
      toast.error('Failed to delete live session. Network or server error.');
      
      // Offer force delete option for network errors
      if (window.confirm('Delete failed due to network error. Would you like to try force delete from frontend?')) {
        const updatedSchedules = schedules.filter(s => s.id !== id);
        setSchedules(updatedSchedules);
        toast.success('Session removed from display. Please check if deletion persisted after page refresh.');
      }
    }
  };

  const handleSaveSchedules = async () => {
    setSaving(true);
    
    try {
      // Refresh data from backend
      await loadSchedules();
      toast.success('Schedules refreshed from server!');
    } catch (error) {
      toast.error('Failed to refresh schedules');
    } finally {
      setSaving(false);
    }
  };

  const handleForceDeleteAll = async () => {
    if (!window.confirm('⚠️ WARNING: This will force delete ALL live sessions from display. This should only be used if individual deletions are failing. Continue?')) {
      return;
    }

    if (!window.confirm('🚨 FINAL WARNING: Are you absolutely sure? This will clear all live sessions from the current view.')) {
      return;
    }

    try {
      // Clear all schedules from frontend
      setSchedules([]);
      toast.success('All sessions cleared from display. Refresh to see if any persist in database.');
      
      // Optional: Try to refresh data to see what remains
      setTimeout(async () => {
        await loadSchedules();
      }, 2000);
      
    } catch (error) {
      console.error('Error force deleting all sessions:', error);
      toast.error('Failed to clear sessions');
    }
  };

  const handleBulkDeleteByCourse = async () => {
    if (schedules.length === 0) {
      toast.error('No sessions to delete');
      return;
    }

    // Group sessions by course
    const courseGroups = schedules.reduce((acc, schedule) => {
      if (!acc[schedule.courseId]) {
        acc[schedule.courseId] = {
          courseTitle: schedule.courseTitle,
          sessions: []
        };
      }
      acc[schedule.courseId].sessions.push(schedule);
      return acc;
    }, {} as any);

    const courseOptions = Object.keys(courseGroups).map(courseId => ({
      id: courseId,
      title: courseGroups[courseId].courseTitle,
      count: courseGroups[courseId].sessions.length
    }));

    const selectedCourse = courseOptions[0]; // For demo, select first course
    
    if (window.confirm(`Delete all ${selectedCourse.count} live sessions from "${selectedCourse.title}"?`)) {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          toast.error('Authentication required. Please login again.');
          return;
        }

        const response = await fetch(`https://iasdesk-educational-platform-2.onrender.com/api/admin/courses/${selectedCourse.id}/live-sessions/all`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(`Deleted ${data.deletedCount || selectedCourse.count} sessions from ${selectedCourse.title}`);
          await loadSchedules(); // Refresh data
        } else {
          throw new Error('Backend deletion failed');
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        toast.error('Backend deletion failed. Trying frontend cleanup...');
        
        // Fallback: remove from frontend
        const updatedSchedules = schedules.filter(s => s.courseId !== selectedCourse.id);
        setSchedules(updatedSchedules);
        toast.success('Sessions removed from display');
      }
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
          <span>{saving ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
        
        {schedules.length > 0 && (
          <>
            <button
              onClick={handleBulkDeleteByCourse}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Bulk Delete by Course</span>
            </button>
            
            <button
              onClick={handleForceDeleteAll}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Force Delete All</span>
            </button>
          </>
        )}
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
          
          {/* Debug Info */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <strong>Debug Info:</strong> Found {schedules.length} live sessions from API
            {schedules.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer">Show Raw Session Data</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(schedules, null, 2)}
                </pre>
              </details>
            )}
          </div>
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
    </div>
  );
};

export default LiveClassManager;
