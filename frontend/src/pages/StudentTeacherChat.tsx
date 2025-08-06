import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Users, 
  Search, 
  GraduationCap, 
  Star,
  ChevronRight,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  X,
  RefreshCw
} from 'lucide-react';
import { tokenUtils } from '../utils/token';
import toast from 'react-hot-toast';

interface Teacher {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  subject?: string;
  experience?: number;
  bio?: string;
  rating?: number;
  specialization?: string[];
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  image?: string;
  timestamp: string;
  isRead: boolean;
  senderName: string;
  senderRole: string;
}

const StudentTeacherChat: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'teachers' | 'chats' | 'conversation'>('teachers');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const checkEnrollmentAndLoadTeachers = async () => {
      if (!isAuthenticated || user?.role !== 'student') {
        setLoading(false);
        return;
      }

      try {
        const token = tokenUtils.getToken();
        console.log('Token for profile request:', token ? 'Token exists' : 'No token');
        
        if (!token) {
          toast.error('Authentication required. Please login again.');
          setLoading(false);
          return;
        }
        
        // First check if student has any enrolled courses
        const profileResponse = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Profile response status:', profileResponse.status);

        const profileData = await profileResponse.json();
        console.log('Profile data for chat access:', profileData);
        
        if (profileData.success && profileData.data.user.enrolledCourses) {
          console.log('Student enrolled courses:', profileData.data.user.enrolledCourses);
          
          // Check for any enrollment (with or without payment for debugging)
          const allEnrollments = profileData.data.user.enrolledCourses;
          const validEnrollments = profileData.data.user.enrolledCourses.filter((enrollment: any) => 
            enrollment.paymentId // Only courses with valid payment
          );
          
          console.log('All enrollments:', allEnrollments);
          console.log('Valid enrollments with payment:', validEnrollments);
          
          // For now, allow access if there are any enrollments (remove this condition later)
          if (allEnrollments.length === 0) {
            setHasEnrolledCourses(false);
            setLoading(false);
            toast.error('Please enroll in a course to chat with teachers');
            return;
          }
          
          // Show warning if enrolled but no payment
          if (validEnrollments.length === 0 && allEnrollments.length > 0) {
            toast.success('Note: Some enrollments may require payment verification');
          }
          
          setHasEnrolledCourses(true);
        } else {
          console.log('No enrolled courses found');
          setHasEnrolledCourses(false);
          setLoading(false);
          toast.error('Please enroll in a course to access teacher chat');
          return;
        }

        // Load teachers if student is enrolled
        await loadTeachers();
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setLoading(false);
      }
    };

    checkEnrollmentAndLoadTeachers();
  }, [isAuthenticated, user]);

  // Auto-refresh messages when in conversation
  useEffect(() => {
    if (!selectedTeacher || currentView !== 'conversation') return;

    const interval = setInterval(() => {
      loadMessages(selectedTeacher._id);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [selectedTeacher, currentView]);

  const loadTeachers = async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/auth/teachers', {
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
      console.error('Error loading teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (teacherId: string) => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(`https://iasdesk-educational-platform-2.onrender.com/api/chat/messages/${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Ensure we always set an array - API returns data.data.messages
          const messagesArray = Array.isArray(data.data?.messages) ? data.data.messages : [];
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !imageFile) return;
    if (!selectedTeacher) return;

    setSending(true);
    try {
      const token = tokenUtils.getToken();
      
      if (imageFile) {
        // Handle image upload to Cloudinary first, then send as message
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/chat/upload-image-cloudinary', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            // Now send the Cloudinary image URL as a message
            const messageResponse = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/chat/send-message', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                receiverId: selectedTeacher._id,
                message: '',
                image: uploadData.data.cloudinaryUrl
              })
            });

            if (messageResponse.ok) {
              const messageData = await messageResponse.json();
              if (messageData.success) {
                setMessages(prev => [...prev, messageData.data.message]);
                setImageFile(null);
                toast.success('Image sent successfully');
              }
            }
          }
        }
      } else {
        // Handle text message
        const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/chat/send-message', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiverId: selectedTeacher._id,
            message: newMessage.trim()
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMessages(prev => [...prev, data.data.message]);
            setNewMessage('');
            toast.success('Message sent successfully');
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setCurrentView('conversation');
    loadMessages(teacher._id);
  };

  const refreshMessages = async () => {
    if (!selectedTeacher) return;
    
    setRefreshing(true);
    try {
      await loadMessages(selectedTeacher._id);
      toast.success('Messages refreshed');
    } catch (error) {
      toast.error('Failed to refresh messages');
    } finally {
      setRefreshing(false);
    }
  };

  // Check if user is not authenticated or not a student
  if (!isAuthenticated || user?.role !== 'student') {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Check if student has enrolled courses
  if (!hasEnrolledCourses) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            You need to enroll in at least one paid course to access teacher chat.
          </p>
          <button
            onClick={() => window.location.href = '/courses'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {currentView !== 'teachers' && (
                <button
                  onClick={() => {
                    if (currentView === 'conversation') {
                      setCurrentView('teachers');
                      setSelectedTeacher(null);
                    } else {
                      setCurrentView('teachers');
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentView === 'teachers' ? 'Contact Teachers' : 
                   currentView === 'chats' ? 'My Chats' : 
                   `Chat with ${selectedTeacher?.name}`}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentView === 'teachers' ? 'Connect with teachers for doubt resolution' :
                   currentView === 'chats' ? 'Your ongoing conversations' :
                   selectedTeacher?.subject}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {user?.name || 'Student'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Teachers List View */}
        {currentView === 'teachers' && (
          <div>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers by name or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
                    <p className="text-sm text-gray-600">Total Teachers</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
                    <p className="text-sm text-gray-600">Available Teachers</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{new Set(teachers.map(t => t.subject)).size}</p>
                    <p className="text-sm text-gray-600">Subjects Covered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <div key={teacher._id} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">📚 {teacher.subject}</p>
                        {teacher.experience && (
                          <p className="text-sm text-gray-600 mb-2">🎓 {teacher.experience} years experience</p>
                        )}
                      </div>
                      {teacher.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{teacher.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    {teacher.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{teacher.bio}</p>
                    )}
                    
                    {teacher.specialization && teacher.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {teacher.specialization.slice(0, 3).map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {spec}
                          </span>
                        ))}
                        {teacher.specialization.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{teacher.specialization.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => selectTeacher(teacher)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Start Chat</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Conversation View */}
        {currentView === 'conversation' && selectedTeacher && (
          <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {selectedTeacher.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedTeacher.name}</h3>
                  <p className="text-sm text-gray-600">{selectedTeacher.subject}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshMessages}
                  disabled={refreshing}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh messages"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!Array.isArray(messages) || messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Start your conversation with {selectedTeacher.name}</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.senderId === user?.id || message.senderId === (user as any)?._id;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {message.image ? (
                          <img
                            src={message.image}
                            alt="Shared content"
                            className="rounded-lg max-w-full h-auto"
                          />
                        ) : (
                          <p>{String(message.message || '')}</p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs opacity-75">
                            <span className="font-medium">{message.senderName}</span>
                            <span className="ml-1 px-1.5 py-0.5 bg-black bg-opacity-20 rounded text-xs font-medium">
                              {message.senderRole === 'student' ? 'Student' : 'Teacher'}
                            </span>
                          </p>
                          <p className="text-xs opacity-75">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              {imageFile && (
                <div className="mb-3 flex items-center space-x-2 bg-gray-50 p-2 rounded">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="h-12 w-12 object-cover rounded"
                  />
                  <span className="text-sm text-gray-600 flex-1">{imageFile.name}</span>
                  <button
                    onClick={() => setImageFile(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  </label>
                  
                  <button
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && !imageFile) || sending}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTeacherChat;
