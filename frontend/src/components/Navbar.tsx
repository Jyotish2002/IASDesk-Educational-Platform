import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronDown, 
  LogOut,
  ShoppingCart,
  Settings,
  Video,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tokenUtils } from '../utils/token';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for enrolled courses from backend
  useEffect(() => {
    const checkEnrolledCourses = async () => {
      if (isAuthenticated) {
        try {
          const token = tokenUtils.getToken();
          const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const userData = await response.json();
          
          if (userData.success && userData.data.user && userData.data.user.enrolledCourses) {
            // Only count courses with valid payment
            const validEnrollments = userData.data.user.enrolledCourses.filter((enrollment: any) => 
              enrollment.paymentId
            );
            
            setHasEnrolledCourses(validEnrollments.length > 0);
          } else {
            setHasEnrolledCourses(false);
          }
        } catch (error) {
          console.error('Error checking enrolled courses:', error);
          setHasEnrolledCourses(false);
        }
      } else {
        setHasEnrolledCourses(false);
      }
    };

    checkEnrolledCourses();
  }, [isAuthenticated, user]);

  // Check for unread messages
  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (isAuthenticated && user?.role === 'student') {
        try {
          const token = tokenUtils.getToken();
          const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/chat/unread-count', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUnreadMessages(data.count || 0);
            }
          }
        } catch (error) {
          console.error('Error checking unread messages:', error);
        }
      } else {
        setUnreadMessages(0);
      }
    };

    checkUnreadMessages();
    
    // Check for unread messages every 30 seconds
    const interval = setInterval(checkUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setActiveDropdown(null);
  };

  const courseCategories = {
    'courses': [
      { name: 'All Courses', path: '/courses', description: 'Browse all available courses' },
      { name: 'UPSC Civil Services', path: '/courses?category=UPSC', description: 'Complete UPSC preparation' },
      { name: 'Class 5-12', path: '/courses?category=Class%205-12', description: 'School education courses' },
      { name: 'SSC Exams', path: '/courses?category=SSC', description: 'Staff Selection Commission' },
      { name: 'Banking', path: '/courses?category=Banking', description: 'Banking sector exams' },
      { name: 'State PSC', path: '/courses?category=State%20PSC', description: 'State Public Service Commission' }
    ],
    'class5-12': [
      { name: 'Class 5-8 Foundation', path: '/courses?category=Class%205-8', description: 'Basic foundation courses' },
      { name: 'Class 9-10 CBSE', path: '/courses?category=Class%209-10', description: 'CBSE board preparation' },
      { name: 'Class 11-12 Science', path: '/courses?category=Class%2011-12%20Science', description: 'PCM/PCB streams' },
      { name: 'Class 11-12 Commerce', path: '/courses?category=Class%2011-12%20Commerce', description: 'Commerce stream' },
      { name: 'JEE/NEET Preparation', path: '/courses?category=JEE%20%26%20NEET', description: 'Engineering & Medical entrance' }
    ],
    'upsc': [
      { name: 'UPSC Prelims', path: '/courses?category=UPSC%20Prelims', description: 'Preliminary examination' },
      { name: 'UPSC Mains', path: '/courses?category=UPSC%20Mains', description: 'Main examination' },
      { name: 'Interview Guidance', path: '/courses?category=UPSC%20Interview', description: 'Personality test preparation' },
      { name: 'Optional Subjects', path: '/courses?category=UPSC%20Optional', description: 'Optional subject courses' },
      { name: 'Current Affairs', path: '/courses?category=Current%20Affairs', description: 'Monthly current affairs' }
    ]
  };

  const DropdownMenu: React.FC<{ 
    items: typeof courseCategories.courses, 
    isOpen: boolean,
    onClose: () => void 
  }> = ({ items, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 w-80 bg-white shadow-xl rounded-lg border border-gray-200 py-4 mt-1 z-50">
        <div className="grid gap-1">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="block px-4 py-3 hover:bg-primary-50 transition-colors group"
              onClick={onClose}
            >
              <div className="font-medium text-gray-900 group-hover:text-primary-600">
                {item.name}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {item.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="./images/banner/logo.jpg"
                alt="IASDesk Logo"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">IASDesk</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between flex-1 ml-8">
            <div className="flex items-center space-x-4 xl:space-x-6" ref={dropdownRef}>
            {/* Courses Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'courses' ? null : 'courses')}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                <span>Courses</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <DropdownMenu
                items={courseCategories.courses}
                isOpen={activeDropdown === 'courses'}
                onClose={() => setActiveDropdown(null)}
              />
            </div>

            {/* Class 5-12 Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'class5-12' ? null : 'class5-12')}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                <span>Class 5-12</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <DropdownMenu
                items={courseCategories['class5-12']}
                isOpen={activeDropdown === 'class5-12'}
                onClose={() => setActiveDropdown(null)}
              />
            </div>

            {/* UPSC Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'upsc' ? null : 'upsc')}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                <span>UPSC</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <DropdownMenu
                items={courseCategories.upsc}
                isOpen={activeDropdown === 'upsc'}
                onClose={() => setActiveDropdown(null)}
              />
            </div>

            {/* Current Affairs */}
            <Link
              to="/current-affairs"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
            >
              Current Affairs
            </Link>

            {/* Chat with Teachers - Show only for authenticated students */}
            {isAuthenticated && user?.role === 'student' && (
              <Link
                to="/chat"
                className="relative flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors whitespace-nowrap"
                title="Chat with Teachers"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden xl:inline">Chat</span>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
            )}

            {/* Live Classes - Show only for enrolled students */}
            {isAuthenticated && hasEnrolledCourses && (
              <Link
                to="/live-classes"
                className="flex items-center space-x-2 px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <Video className="h-4 w-4" />
                <span className="hidden xl:inline">Live</span>
                <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">●</span>
              </Link>
            )}

            {/* Authentication Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                {/* My Courses */}
                <Link
                  to={user?.role === 'teacher' ? "/teacher/dashboard" : "/my-courses"}
                  className="flex items-center space-x-1 px-2 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors"
                  title={user?.role === 'teacher' ? 'Dashboard' : 'My Courses'}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden xl:inline">{user?.role === 'teacher' ? 'Dashboard' : 'My Courses'}</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                    className="flex items-center space-x-2 px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {activeDropdown === 'user' && (
                    <div className="absolute right-0 top-full w-48 bg-white shadow-xl rounded-lg border border-gray-200 py-2 mt-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      {user.role === 'teacher' && (
                        <Link
                          to="/teacher/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Teacher Dashboard</span>
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                <Link
                  to="/teacher-login"
                  className="px-3 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 text-sm"
                >
                  Teacher
                </Link>
                <Link
                  to="/admin-login"
                  className="px-3 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 text-sm"
                >
                  Admin
                </Link>
                <Link
                  to="/auth"
                  className="px-3 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/courses"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              All Courses
            </Link>
            <Link
              to="/courses?category=Class%205-12"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Class 5-12
            </Link>
            <Link
              to="/courses?category=UPSC"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              UPSC
            </Link>
            <Link
              to="/current-affairs"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Current Affairs
            </Link>
            
            {/* Chat with Teachers for mobile - Show only for authenticated students */}
            {isAuthenticated && user?.role === 'student' && (
              <Link
                to="/chat"
                className="relative flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat with Teachers</span>
                {unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
            )}
            
            {/* Live Classes for mobile - Show only for enrolled students */}
            {isAuthenticated && hasEnrolledCourses && (
              <Link
                to="/live-classes"
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Video className="h-4 w-4" />
                <span>Live Classes</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">LIVE</span>
              </Link>
            )}
            
            {isAuthenticated && user ? (
              <>
                <hr className="my-2" />
                <Link
                  to="/settings"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/my-courses"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Courses
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <hr className="my-2" />
                <Link
                  to="/auth"
                  className="block px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="block px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
