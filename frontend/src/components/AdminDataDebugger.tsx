import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AdminDataDebugger: React.FC = () => {
  const [coursesData, setCoursesData] = useState<any>(null);
  const [meetingLinksData, setMeetingLinksData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCoursesAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCoursesData(data);
        console.log('Courses API Response:', data);
        toast.success('Courses API tested successfully');
      } else {
        toast.error(`Courses API failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Courses API Error:', error);
      toast.error('Courses API error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testMeetingLinksAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/admin/meeting-links', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetingLinksData(data);
        console.log('Meeting Links API Response:', data);
        toast.success('Meeting Links API tested successfully');
      } else {
        toast.error(`Meeting Links API failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Meeting Links API Error:', error);
      toast.error('Meeting Links API error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createTestSession = async () => {
    if (!coursesData?.data?.courses?.length) {
      toast.error('Please test Courses API first to get course IDs');
      return;
    }

    const firstCourse = coursesData.data.courses[0];
    const testSession = {
      title: 'Admin Test Session',
      date: '2025-08-07', // Tomorrow
      time: '19:00',
      meetLink: 'https://meet.google.com/admin-test-session'
    };

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch(`https://iasdesk-educational-platform-2.onrender.com/api/admin/courses/${firstCourse._id}/live-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testSession)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test Session Created:', data);
        toast.success('Test session created successfully!');
        
        // Refresh both APIs to see if the session appears
        await testCoursesAPI();
        await testMeetingLinksAPI();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create session: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Create Session Error:', error);
      toast.error('Create session error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Data Debugger</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testCoursesAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Test Courses API
        </button>
        
        <button
          onClick={testMeetingLinksAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Test Meeting Links API
        </button>
        
        <button
          onClick={createTestSession}
          disabled={loading || !coursesData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Create Test Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Data */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Courses API Response</h3>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
            <pre className="text-xs">
              {coursesData ? JSON.stringify(coursesData, null, 2) : 'No data - click "Test Courses API"'}
            </pre>
          </div>
        </div>

        {/* Meeting Links Data */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Meeting Links API Response</h3>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
            <pre className="text-xs">
              {meetingLinksData ? JSON.stringify(meetingLinksData, null, 2) : 'No data - click "Test Meeting Links API"'}
            </pre>
          </div>
        </div>
      </div>

      {/* Analysis */}
      {coursesData && meetingLinksData && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Analysis</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Courses with Live Sessions:</strong> {
                coursesData.data?.courses?.filter((course: any) => 
                  course.liveSessions && course.liveSessions.length > 0
                ).length || 0
              }
            </div>
            <div>
              <strong>Total Live Sessions in Courses API:</strong> {
                coursesData.data?.courses?.reduce((total: number, course: any) => 
                  total + (course.liveSessions?.length || 0), 0
                ) || 0
              }
            </div>
            <div>
              <strong>Live Sessions in Meeting Links API:</strong> {
                meetingLinksData.data?.liveSessions?.length || 0
              }
            </div>
            <div>
              <strong>Data Consistency:</strong> {
                (coursesData.data?.courses?.reduce((total: number, course: any) => 
                  total + (course.liveSessions?.length || 0), 0
                ) || 0) === (meetingLinksData.data?.liveSessions?.length || 0) 
                  ? '✅ Consistent' 
                  : '❌ Inconsistent - Check data sync!'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataDebugger;
