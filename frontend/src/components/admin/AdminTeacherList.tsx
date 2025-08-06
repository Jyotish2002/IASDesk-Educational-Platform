import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  BookOpen, 
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  subject: string;
  experience: number;
  bio: string;
  specialization: string[];
  isActive: boolean;
  isProfileComplete: boolean;
  rating: number;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
}

interface AdminTeacherListProps {
  onEdit?: (teacher: Teacher) => void;
}

const AdminTeacherList: React.FC<AdminTeacherListProps> = ({ onEdit }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeachers = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(page === 1);
      setRefreshing(page !== 1);

      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status
      });

      const response = await fetch(`http://localhost:5000/api/admin/teachers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setTeachers(result.data.teachers);
        setTotalPages(result.data.pagination.pages);
      } else {
        toast.error(result.message || 'Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeachers(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${teacherName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/teacher/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Teacher deleted successfully');
        fetchTeachers(currentPage, searchTerm, statusFilter);
      } else {
        toast.error(result.message || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher');
    }
  };

  const handleResetPassword = async (teacherId: string, teacherMobile: string) => {
    if (!window.confirm(`Reset password for teacher (${teacherMobile})? New password will be their mobile number.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/reset-teacher-password/${teacherId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Password reset successfully. New password: ${result.data.tempPassword}`);
      } else {
        toast.error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const getStatusBadge = (teacher: Teacher) => {
    if (!teacher.isActive) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Inactive</span>;
    }
    if (!teacher.isProfileComplete) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending Setup</span>;
    }
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            Teachers List
          </h2>
          <p className="text-gray-600 text-sm">Manage and monitor teacher accounts</p>
        </div>
        
        <button
          onClick={() => fetchTeachers(currentPage, searchTerm, statusFilter)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <div key={teacher._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-4">
              {getStatusBadge(teacher)}
              <div className="flex gap-1">
                {teacher.isOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
                )}
                {!teacher.isProfileComplete && (
                  <div title="Profile Incomplete">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Teacher Info */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {teacher.name || 'Name not set'}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {teacher.mobile}
                </p>
              </div>

              {teacher.email && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {teacher.email}
                </p>
              )}

              {teacher.subject && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {teacher.subject}
                </p>
              )}

              {teacher.experience > 0 && (
                <p className="text-sm text-gray-600">
                  {teacher.experience} years experience
                </p>
              )}

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(teacher.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button
                onClick={() => onEdit?.(teacher)}
                className="flex-1 px-3 py-2 text-sm bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
              
              <button
                onClick={() => handleResetPassword(teacher._id, teacher.mobile)}
                className="px-3 py-2 text-sm bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-md transition-colors"
                title="Reset Password"
              >
                Reset
              </button>
              
              <button
                onClick={() => handleDeleteTeacher(teacher._id, teacher.name || teacher.mobile)}
                className="px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                title="Delete Teacher"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {teachers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first teacher account to get started'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTeacherList;
