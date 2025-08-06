import React, { useState } from 'react';
import { Users, Plus, List } from 'lucide-react';
import AdminTeacherManagement from './AdminTeacherManagement';
import AdminTeacherList from './AdminTeacherList';

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

const AdminTeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  const handleEditTeacher = (teacher: Teacher) => {
    // For future implementation - could open edit modal or form
    console.log('Edit teacher:', teacher);
    setActiveTab('create'); // Switch to create tab for editing
  };

  const tabs = [
    {
      id: 'create' as const,
      name: 'Add Teacher',
      icon: Plus,
      description: 'Create new teacher accounts'
    },
    {
      id: 'list' as const,
      name: 'Manage Teachers',
      icon: List,
      description: 'View and manage existing teachers'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
          </div>
          <p className="text-gray-600">
            Create and manage teacher accounts for your educational platform
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 ${
                    activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'create' && (
            <div className="p-6">
              <AdminTeacherManagement />
            </div>
          )}
          
          {activeTab === 'list' && (
            <div className="p-6">
              <AdminTeacherList onEdit={handleEditTeacher} />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                <p className="text-2xl font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Teachers</p>
                <p className="text-2xl font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Setup</p>
                <p className="text-2xl font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Online Now</p>
                <p className="text-2xl font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Process Info */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Onboarding Process</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Admin Creates Account</h4>
              <p className="text-sm text-gray-600">Admin enters teacher's mobile number and creates account</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Initial Login</h4>
              <p className="text-sm text-gray-600">Teacher logs in with mobile number only (no password needed)</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Complete Profile</h4>
              <p className="text-sm text-gray-600">Teacher sets name, password, subject, and other details</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Regular Login</h4>
              <p className="text-sm text-gray-600">Future logins require mobile number + password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherDashboard;
