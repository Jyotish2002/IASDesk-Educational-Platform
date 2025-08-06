import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  Clock,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tokenUtils } from '../utils/token';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  image?: string;
  timestamp: Date;
  isRead: boolean;
  senderName: string;
  senderRole: 'student' | 'teacher';
}

interface TeacherStudentChatProps {
  teacherId: string;
  teacherName: string;
  onClose: () => void;
}

const TeacherStudentChat: React.FC<TeacherStudentChatProps> = ({ 
  teacherId, 
  teacherName, 
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages between teacher and student
  const fetchMessages = useCallback(async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(`http://localhost:5000/api/chat/messages/${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchMessages();
    // Set up polling for real-time updates
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = tokenUtils.getToken();
      const response = await fetch('http://localhost:5000/api/chat/upload-image-cloudinary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        return data.data.cloudinaryUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    setLoading(true);
    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          alert('Failed to upload image');
          setLoading(false);
          return;
        }
      }

      const token = tokenUtils.getToken();
      const response = await fetch('http://localhost:5000/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: teacherId,
          message: newMessage.trim(),
          image: imageUrl
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview(null);
        fetchMessages(); // Refresh messages
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
    setLoading(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{teacherName}</h3>
            <p className="text-primary-200 text-sm">Teacher</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.senderId === user?.id;
              const showDate = index === 0 || 
                formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

              return (
                <div key={message._id}>
                  {showDate && (
                    <div className="text-center text-gray-500 text-sm mb-4">
                      {formatDate(message.timestamp)}
                    </div>
                  )}
                  
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {!isOwnMessage && (
                        <div className="text-xs font-medium mb-1">
                          <span className="text-blue-600 font-semibold">{message.senderName}</span>
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {message.senderRole === 'student' ? 'Student' : message.senderRole || 'Student'}
                          </span>
                        </div>
                      )}
                      
                      {message.image && (
                        <div className="mb-2">
                          <img
                            src={message.image}
                            alt="Shared content"
                            className="max-w-full h-auto rounded-lg cursor-pointer"
                            onClick={() => window.open(message.image, '_blank')}
                          />
                        </div>
                      )}
                      
                      {message.message && (
                        <p className="break-words">{message.message}</p>
                      )}
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        isOwnMessage ? 'text-primary-200' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.timestamp)}</span>
                        {isOwnMessage && (
                          <CheckCheck className={`h-3 w-3 ${
                            message.isRead ? 'text-green-400' : 'text-primary-200'
                          }`} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 py-2 bg-gray-50 border-t">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message or question..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                disabled={uploading}
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={sendMessage}
                disabled={loading || uploading || (!newMessage.trim() && !selectedImage)}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading || uploading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentChat;
