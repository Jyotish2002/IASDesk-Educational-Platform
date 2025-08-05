import React, { useState, useEffect } from 'react';
import { Video, Clock, Calendar, Users, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

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

interface LiveSession {
  _id: string;
  date: string;
  time: string;
  meetLink: string;
  title: string;
  isActive: boolean;
}

const GoogleMeetScheduler: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Schedule form data
  const [scheduleForm, setScheduleForm] = useState({
    dailyTime: '',
    meetLink: '',
    timezone: 'Asia/Kolkata'
  });

  // Live session form data
  const [sessionForm, setSessionForm] = useState({
    date: '',
    time: '',
    meetLink: '',
    title: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/courses', {
        headers: {
          'x-admin-token': 'admin-authenticated'
        }
      });
      const data = await response.json();
      
      if (data.success && data.data?.courses) {
        setCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
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
      const response = await fetch(`http://localhost:5000/api/admin/courses/${selectedCourse}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(scheduleForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Daily schedule updated successfully!');
        setShowScheduleModal(false);
        setScheduleForm({ dailyTime: '', meetLink: '', timezone: 'Asia/Kolkata' });
        fetchCourses();
      } else {
        toast.error(data.message || 'Failed to update schedule');
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
      const response = await fetch(`http://localhost:5000/api/admin/courses/${selectedCourse}/live-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(sessionForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Live session added successfully!');
        setShowSessionModal(false);
        setSessionForm({ date: '', time: '', meetLink: '', title: '' });
        fetchCourses();
      } else {
        toast.error(data.message || 'Failed to add live session');
      }
    } catch (error) {
      console.error('Error adding live session:', error);
      toast.error('Failed to add live session');
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Schedule</h3>
            {selectedCourseData.meetSchedule?.isActive ? (
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
              <p className="text-gray-500">No daily schedule set</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Clock className="h-4 w-4 mr-2" />
              Set Daily Schedule
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
