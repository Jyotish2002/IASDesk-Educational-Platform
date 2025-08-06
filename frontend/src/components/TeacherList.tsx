import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Clock, Users } from 'lucide-react';
import { tokenUtils } from '../utils/token';
import TeacherStudentChat from './TeacherStudentChat';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  experience?: number;
  rating?: number;
  isOnline?: boolean;
  lastSeen?: Date;
  profileImage?: string;
  specialization?: string[];
}

const TeacherList: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/teachers/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setTeachers(data.data.teachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.specialization?.some(spec => 
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getOnlineStatus = (teacher: Teacher) => {
    if (teacher.isOnline) {
      return { status: 'Online', color: 'bg-green-500' };
    }
    
    if (teacher.lastSeen) {
      const lastSeen = new Date(teacher.lastSeen);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - lastSeen.getTime()) / 36e5;
      
      if (diffInHours < 1) {
        return { status: 'Recently active', color: 'bg-yellow-500' };
      } else if (diffInHours < 24) {
        return { status: `Active ${Math.floor(diffInHours)}h ago`, color: 'bg-gray-500' };
      } else {
        return { status: `Active ${Math.floor(diffInHours / 24)}d ago`, color: 'bg-gray-500' };
      }
    }
    
    return { status: 'Offline', color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teachers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask Your Teachers</h1>
          <p className="text-gray-600">Connect with your teachers for personalized guidance and support</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search teachers by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => {
            const onlineStatus = getOnlineStatus(teacher);
            
            return (
              <div
                key={teacher._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                {/* Teacher Info */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    {teacher.profileImage ? (
                      <img
                        src={teacher.profileImage}
                        alt={teacher.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {teacher.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${onlineStatus.color} rounded-full border-2 border-white`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    {teacher.subject && (
                      <p className="text-sm text-gray-600">{teacher.subject}</p>
                    )}
                    <p className="text-xs text-gray-500">{onlineStatus.status}</p>
                  </div>
                </div>

                {/* Teacher Details */}
                <div className="space-y-2 mb-4">
                  {teacher.experience && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{teacher.experience} years experience</span>
                    </div>
                  )}
                  
                  {teacher.rating && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                      <span>{teacher.rating.toFixed(1)} rating</span>
                    </div>
                  )}
                </div>

                {/* Specializations */}
                {teacher.specialization && teacher.specialization.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.specialization.slice(0, 3).map((spec, index) => (
                        <span
                          key={index}
                          className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {teacher.specialization.length > 3 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{teacher.specialization.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Start Chat Button */}
                <button
                  onClick={() => setSelectedTeacher(teacher)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Start Chat</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* No Teachers Found */}
        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No teachers are available at the moment'}
            </p>
          </div>
        )}

        {/* Chat Modal */}
        {selectedTeacher && (
          <TeacherStudentChat
            teacherId={selectedTeacher._id}
            teacherName={selectedTeacher.name}
            onClose={() => setSelectedTeacher(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherList;
