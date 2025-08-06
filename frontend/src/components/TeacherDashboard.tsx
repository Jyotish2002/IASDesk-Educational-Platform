import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  Clock, 
  User,
  Bell,
  CheckCheck,
  Video,
  Calendar,
  ExternalLink
} from 'lucide-react';
import TeacherStudentChat from './TeacherStudentChat';
import { tokenUtils } from '../utils/token';

interface ChatPreview {
  _id: string;
  studentId: string;
  studentName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  hasImage: boolean;
  isOnline: boolean;
}

interface MeetSession {
  _id: string;
  title: string;
  courseTitle: string;
  date: string;
  time: string;
  startTime?: string; // Backend compatibility
  meetLink: string;
  type: 'daily' | 'live';
  isActive: boolean;
}

const TeacherDashboard: React.FC = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [meetSessions, setMeetSessions] = useState<MeetSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'meetings'>('chats');

  useEffect(() => {
    fetchChats();
    fetchMeetSessions();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchChats();
      fetchMeetSessions();
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMeetSessions = async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/teachers/meet-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setMeetSessions(data.data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching meet sessions:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/teachers/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setChats(data.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  const filteredChats = chats.filter(chat =>
    chat.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnreadMessages = chats.reduce((total, chat) => total + chat.unreadCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
              <p className="text-gray-600">Manage your student conversations and classes</p>
            </div>
            
            {totalUnreadMessages > 0 && (
              <div className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="font-medium">
                  {totalUnreadMessages} unread message{totalUnreadMessages !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('chats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Student Chats
                  {totalUnreadMessages > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalUnreadMessages}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('meetings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'meetings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  My Classes
                  {meetSessions.length > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {meetSessions.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Search - Only show for chats */}
        {activeTab === 'chats' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'chats' ? (
          /* Chat List */
          <div className="bg-white rounded-lg shadow-md">
            {filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No students found matching your search' : 'Students will appear here when they start a conversation with you'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Student Avatar */}
                    <div className="relative">
                      <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      {chat.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chat.studentName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {chat.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {chat.hasImage && (
                          <span className="text-primary-600 text-sm">📷</span>
                        )}
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage ? (
                            chat.lastMessage.length > 50 
                              ? chat.lastMessage.substring(0, 50) + '...'
                              : chat.lastMessage
                          ) : 'Image'}
                        </p>
                      </div>
                    </div>

                    {/* Read Indicator */}
                    <div className="text-gray-400">
                      <CheckCheck className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        ) : (
          /* Google Meet Sessions */
          <div className="bg-white rounded-lg shadow-md">
            {meetSessions.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No classes assigned</h3>
                <p className="text-gray-600">
                  Your assigned Google Meet sessions will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {meetSessions.map((session) => (
                  <div key={session._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                            <p className="text-sm text-gray-600">{session.courseTitle}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 ml-15">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {session.type === 'daily' 
                                ? `Daily at ${session.time || session.startTime || 'TBD'}` 
                                : `${new Date(session.date).toLocaleDateString()} at ${session.time || session.startTime || 'TBD'}`
                              }
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              session.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {session.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {session.isActive && session.meetLink ? (
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join Class
                          </a>
                        ) : (
                          <div className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {!session.isActive ? 'Inactive Session' : 'No Meet Link'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
                <p className="text-gray-600">Total Conversations</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{totalUnreadMessages}</p>
                <p className="text-gray-600">Unread Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {chats.filter(chat => chat.isOnline).length}
                </p>
                <p className="text-gray-600">Students Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Modal */}
        {selectedChat && (
          <TeacherStudentChat
            teacherId={selectedChat.studentId} // In teacher view, we're chatting with student
            teacherName={selectedChat.studentName}
            onClose={() => {
              setSelectedChat(null);
              fetchChats(); // Refresh to update unread counts
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
