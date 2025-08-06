import React, { useState, useEffect } from 'react';
import { Video, Clock, Plus, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { tokenUtils } from '../utils/token';

interface Course {
  _id: string;
  title: string;
  meetSchedule?: {
    dailyTime: string;
    timezone: string;
    isActive: boolean;
  };
  meetLink?: string;
  liveSessions?: LiveSession[];
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  mobile: string;
}

interface LiveSession {
  _id: string;
  date: string;
  time: string;
  meetLink: string;
  title: string;
  isActive: boolean;
  assignedTeachers?: string[];
  teacherNames?: string[];
}

const GoogleMeetScheduler: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Schedule form data
  const [scheduleForm, setScheduleForm] = useState({
    dailyTime: '',
    meetLink: '',
    timezone: 'Asia/Kolkata',
    assignedTeachers: [] as string[]
  });

  // Live session form data
  const [sessionForm, setSessionForm] = useState({
    date: '',
    time: '',
    meetLink: '',
    title: '',
    assignedTeachers: [] as string[]
  });

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = tokenUtils.getAdminToken();
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTeachers(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers');
    }
  };

  const fetchCourses = async () => {
    try {
      const token = tokenUtils.getAdminToken();
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.courses) {
          setCourses(data.data.courses);
          console.log('Courses loaded for Google Meet Scheduler:', data.data.courses.length);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDailySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    try {
      const token = tokenUtils.getAdminToken();
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/courses/${selectedCourse}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Daily schedule updated successfully!');
          setShowScheduleModal(false);
          setScheduleForm({ dailyTime: '', meetLink: '', timezone: 'Asia/Kolkata', assignedTeachers: [] });
          // Refresh courses to show updated schedule
          await fetchCourses();
        } else {
          toast.error(data.message || 'Failed to update schedule');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const handleAddLiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    try {
      const token = tokenUtils.getAdminToken();
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/courses/${selectedCourse}/live-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sessionForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Live session added successfully!');
          setShowSessionModal(false);
          setSessionForm({ date: '', time: '', meetLink: '', title: '', assignedTeachers: [] });
          // Refresh courses to show updated sessions
          await fetchCourses();
        } else {
          toast.error(data.message || 'Failed to add live session');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add live session');
      }
    } catch (error) {
      console.error('Error adding live session:', error);
      toast.error('Failed to add live session');
    }
  };

  const handleDeleteDailySchedule = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (!window.confirm('Are you sure you want to delete the daily schedule for this course?')) {
      return;
    }

    try {
      const token = tokenUtils.getAdminToken();
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/courses/${selectedCourse}/schedule`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Daily schedule deleted successfully!');
          // Refresh courses to show updated schedule
          await fetchCourses();
        } else {
          toast.error(data.message || 'Failed to delete schedule');
        }
      } else {
        // If DELETE endpoint doesn't exist, try updating with empty values
        const updateResponse = await fetch(`http://localhost:5000/api/admin/courses/${selectedCourse}/schedule`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            dailyTime: '',
            meetLink: '',
            timezone: 'Asia/Kolkata',
            isActive: false
          })
        });

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          if (updateData.success) {
            toast.success('Daily schedule cleared successfully!');
            await fetchCourses();
          } else {
            toast.error(updateData.message || 'Failed to clear schedule');
          }
        } else {
          const errorData = await updateResponse.json();
          toast.error(errorData.message || 'Failed to delete schedule');
        }
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleDeleteLiveSession = async (sessionId: string) => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this live session?')) {
      return;
    }

    try {
      const token = tokenUtils.getAdminToken();
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/courses/${selectedCourse}/live-session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Live session deleted successfully!');
          // Refresh courses to show updated sessions
          await fetchCourses();
        } else {
          toast.error(data.message || 'Failed to delete live session');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete live session');
      }
    } catch (error) {
      console.error('Error deleting live session:', error);
      toast.error('Failed to delete live session');
    }
  };

  const selectedCourseData = courses.find(course => course._id === selectedCourse);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Video className="h-6 w-6 mr-2 text-primary-600" />
          Google Meet Scheduler
        </h2>
      </div>

      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Choose a course...</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && selectedCourseData && (
        <div className="space-y-6">
          {/* Current Schedule Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Current Schedule</h3>
              {selectedCourseData.meetSchedule?.isActive && 
               selectedCourseData.meetSchedule?.dailyTime && 
               selectedCourseData.meetLink && (
                <button
                  onClick={handleDeleteDailySchedule}
                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <X className="h-3 w-3 mr-1" />
                  Delete Schedule
                </button>
              )}
            </div>
            {selectedCourseData.meetSchedule?.isActive && 
             selectedCourseData.meetSchedule?.dailyTime && 
             selectedCourseData.meetLink ? (
              <div className="space-y-2">
                <div className="flex items-center text-green-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Daily Class: {selectedCourseData.meetSchedule.dailyTime}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Video className="h-4 w-4 mr-2" />
                  <span className="truncate">Meet Link: {selectedCourseData.meetLink}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-500">No daily schedule set</p>
                <p className="text-sm text-gray-400">
                  Use "Set Daily Schedule" to configure recurring Google Meet sessions
                </p>
              </div>
            )}
          </div>

          {/* Live Sessions Display */}
          {selectedCourseData.liveSessions && selectedCourseData.liveSessions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Live Sessions</h3>
              <div className="space-y-3">
                {selectedCourseData.liveSessions
                  .filter(session => session.isActive) // Only show active sessions
                  .map((session) => (
                    <div key={session._id} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{session.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(session.date).toLocaleDateString()} at {session.time}
                        </div>
                        {session.teacherNames && session.teacherNames.length > 0 && (
                          <div className="flex items-center mt-1">
                            <Users className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">
                              Teachers: {session.teacherNames.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-blue-600">
                          <Video className="h-4 w-4 mr-1" />
                          <span className="text-sm">Meet Ready</span>
                        </div>
                        <button
                          onClick={() => handleDeleteLiveSession(session._id)}
                          className="flex items-center px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                {selectedCourseData.liveSessions.filter(session => session.isActive).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No active live sessions scheduled.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 flex-wrap">
            <button
              onClick={() => {
                // Pre-populate form with existing data if available
                if (selectedCourseData.meetSchedule?.dailyTime) {
                  setScheduleForm(prev => ({
                    ...prev,
                    dailyTime: selectedCourseData.meetSchedule?.dailyTime || '',
                    meetLink: selectedCourseData.meetLink || '',
                    timezone: selectedCourseData.meetSchedule?.timezone || 'Asia/Kolkata'
                  }));
                }
                setShowScheduleModal(true);
              }}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Clock className="h-4 w-4 mr-2" />
              {selectedCourseData.meetSchedule?.isActive ? 'Update Daily Schedule' : 'Set Daily Schedule'}
            </button>
            <button
              onClick={() => setShowSessionModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Live Session
            </button>
          </div>
        </div>
      )}

      {/* Daily Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Set Daily Schedule</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSetDailySchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Time
                </label>
                <input
                  type="time"
                  value={scheduleForm.dailyTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, dailyTime: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Meet Link
                </label>
                <input
                  type="url"
                  value={scheduleForm.meetLink}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, meetLink: e.target.value }))}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Teachers
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {teachers.map((teacher) => (
                    <label key={teacher._id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-2">
                      <input
                        type="checkbox"
                        checked={scheduleForm.assignedTeachers.includes(teacher._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setScheduleForm(prev => ({
                              ...prev,
                              assignedTeachers: [...prev.assignedTeachers, teacher._id]
                            }));
                          } else {
                            setScheduleForm(prev => ({
                              ...prev,
                              assignedTeachers: prev.assignedTeachers.filter(id => id !== teacher._id)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">{teacher.name}</span>
                      <span className="text-xs text-gray-500">({teacher.subject})</span>
                    </label>
                  ))}
                </div>
                {scheduleForm.assignedTeachers.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {scheduleForm.assignedTeachers.length} teacher(s) selected
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Set Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Live Session</h3>
              <button
                onClick={() => setShowSessionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddLiveSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Special Doubt Session"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={sessionForm.time}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Meet Link
                </label>
                <input
                  type="url"
                  value={sessionForm.meetLink}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, meetLink: e.target.value }))}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Teachers
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {teachers.map((teacher) => (
                    <label key={teacher._id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-2">
                      <input
                        type="checkbox"
                        checked={sessionForm.assignedTeachers.includes(teacher._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSessionForm(prev => ({
                              ...prev,
                              assignedTeachers: [...prev.assignedTeachers, teacher._id]
                            }));
                          } else {
                            setSessionForm(prev => ({
                              ...prev,
                              assignedTeachers: prev.assignedTeachers.filter(id => id !== teacher._id)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">{teacher.name}</span>
                      <span className="text-xs text-gray-500">({teacher.subject})</span>
                    </label>
                  ))}
                </div>
                {sessionForm.assignedTeachers.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {sessionForm.assignedTeachers.length} teacher(s) selected
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMeetScheduler;
