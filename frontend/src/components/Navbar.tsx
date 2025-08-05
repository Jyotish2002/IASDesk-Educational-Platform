import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronDown, 
  LogOut,
  Bell,
  BookOpen,
  ShoppingCart,
  Settings,
  Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);
  
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
          const token = localStorage.getItem('token') || localStorage.getItem('authToken');
          const response = await fetch('http://localhost:5000/api/auth/profile', {
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

  const handleLogout = () => {
    logout();
    navigate('/');
    setActiveDropdown(null);
  };

  const courseCategories = {
    'courses': [
      { name: 'All Courses', path: '/courses', description: 'Browse all available courses' },
      { name: 'UPSC Civil Services', path: '/courses/upsc', description: 'Complete UPSC preparation' },
      { name: 'Class 5-12', path: '/courses/school', description: 'School education courses' },
      { name: 'SSC Exams', path: '/courses/ssc', description: 'Staff Selection Commission' },
      { name: 'Banking', path: '/courses/banking', description: 'Banking sector exams' },
      { name: 'State PSC', path: '/courses/state-psc', description: 'State Public Service Commission' }
    ],
    'class5-12': [
      { name: 'Class 5-8 Foundation', path: '/courses/class-5-8', description: 'Basic foundation courses' },
      { name: 'Class 9-10 CBSE', path: '/courses/class-9-10', description: 'CBSE board preparation' },
      { name: 'Class 11-12 Science', path: '/courses/class-11-12-science', description: 'PCM/PCB streams' },
      { name: 'Class 11-12 Commerce', path: '/courses/class-11-12-commerce', description: 'Commerce stream' },
      { name: 'JEE/NEET Preparation', path: '/courses/jee-neet', description: 'Engineering & Medical entrance' }
    ],
    'upsc': [
      { name: 'UPSC Prelims', path: '/courses/upsc-prelims', description: 'Preliminary examination' },
      { name: 'UPSC Mains', path: '/courses/upsc-mains', description: 'Main examination' },
      { name: 'Interview Guidance', path: '/courses/upsc-interview', description: 'Personality test preparation' },
      { name: 'Optional Subjects', path: '/courses/upsc-optional', description: 'Optional subject courses' },
      { name: 'Current Affairs', path: '/courses/upsc-current-affairs', description: 'Monthly current affairs' }
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
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">IASDesk</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8" ref={dropdownRef}>
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
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Current Affairs
            </Link>

            {/* Live Classes - Show only for enrolled students */}
            {isAuthenticated && hasEnrolledCourses && (
              <Link
                to="/live-classes"
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 rounded-lg font-medium transition-colors"
              >
                <Video className="h-4 w-4" />
                <span>Live Classes</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">LIVE</span>
              </Link>
            )}

            {/* Authentication Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4 ml-6">
                {/* Notifications */}
                <button className="relative p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                </button>

                {/* My Courses */}
                <Link
                  to="/my-courses"
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>My Courses</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center">
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
              <div className="flex items-center space-x-3 ml-6">
                <Link
                  to="/admin-login"
                  className="px-4 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 text-sm"
                >
                  Admin
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                >
                  Register
                </Link>
              </div>
            )}
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
              to="/courses/school"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Class 5-12
            </Link>
            <Link
              to="/courses/upsc"
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
