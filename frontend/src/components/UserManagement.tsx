import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  BookOpen,
  Download,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name?: string;
  email?: string;
  mobile: string;
  isVerified: boolean;
  isAdmin: boolean;
  enrolledCourses: Array<{
    courseId: {
      _id: string;
      title: string;
    };
    enrolledAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface UserManagementProps {
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add appropriate authentication headers
      if (adminToken === 'admin-authenticated') {
        headers['x-admin-token'] = adminToken;
      }
      if (authToken && authToken.startsWith('admin-token-')) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`http://localhost:5000/api/admin/users?page=${page}&limit=10&search=${search}`, {
        headers
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.pages);
        setTotalUsers(data.data.pagination.total);
        setCurrentPage(data.data.pagination.current);
      } else {
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  // Check if user is admin
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg font-medium">
          Admin authentication required
        </div>
        <p className="text-gray-500 mt-2">
          Please log in as an admin to access user management.
        </p>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm);
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportUsers = () => {
    const csvContent = users.map(user => 
      `"${user.name || 'N/A'}","${user.mobile}","${user.email || 'N/A'}","${user.enrolledCourses.length}","${formatDate(user.createdAt)}"`
    ).join('\n');
    
    const header = 'Name,Mobile,Email,Enrolled Courses,Joined Date\n';
    const csv = header + csvContent;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users data exported successfully');
  };

  const cleanupInvalidEnrollments = async () => {
    if (!window.confirm('This will remove all enrollments without payment verification. Are you sure you want to continue?')) {
      return;
    }

    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add appropriate authentication headers
      if (adminToken === 'admin-authenticated') {
        headers['x-admin-token'] = adminToken;
      }
      if (authToken && authToken.startsWith('admin-token-')) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/cleanup-enrollments', {
        method: 'POST',
        headers
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        // Refresh the users list
        fetchUsers(currentPage, searchTerm);
      } else {
        toast.error(data.message || 'Failed to cleanup enrollments');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to cleanup enrollments');
    } finally {
      setLoading(false);
    }
  };

  if (showUserDetails && selectedUser) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setShowUserDetails(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              ← Back to Users
            </button>
            <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.name || 'User'}
                </h3>
                <p className="text-gray-600">{selectedUser.mobile}</p>
                {selectedUser.isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                    Admin
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {selectedUser.email || 'No email provided'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{selectedUser.mobile}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    Joined {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {selectedUser.enrolledCourses.length} Enrolled Courses
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses</h4>
            {selectedUser.enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {selectedUser.enrolledCourses.map((enrollment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {enrollment.courseId.title}
                        </h5>
                        <p className="text-sm text-gray-600">
                          Enrolled on {formatDate(enrollment.enrolledAt)}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No courses enrolled yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all registered users and their enrollments</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchUsers(currentPage, searchTerm)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={cleanupInvalidEnrollments}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="Remove enrollments without payment verification"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Invalid Enrollments
          </button>
          <button
            onClick={exportUsers}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-semibold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">With Enrollments</p>
              <p className="text-xl font-semibold text-gray-900">
                {users.filter(u => u.enrolledCourses.length > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-xl font-semibold text-gray-900">
                {users.filter(u => u.isVerified).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-xl font-semibold text-gray-900">
                {users.filter(u => 
                  new Date(u.createdAt).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Users</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled Courses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.mobile}</div>
                        <div className="text-sm text-gray-500">
                          {user.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.enrolledCourses.length} courses
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.enrolledCourses.length > 0 ? 'Active learner' : 'No enrollments'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {user.isVerified && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Verified
                            </span>
                          )}
                          {user.isAdmin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="flex items-center text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
