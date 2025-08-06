import React, { useState } from 'react';
import { Plus, Users, Phone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTeacherManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate mobile number
      if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
        toast.error('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }

      // Get admin token
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Admin authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/create-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mobile })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Teacher account created successfully!');
        toast.success(`Teacher can login with mobile: ${mobile}`, {
          duration: 8000
        });
        
        // Reset form
        setMobile('');
        setShowAddForm(false);
      } else {
        toast.error(result.message || 'Failed to create teacher');
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast.error('Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-600" />
            Teacher Management
          </h1>
          <p className="text-gray-600 mt-1">Create teacher accounts with mobile numbers</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Teacher
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Teacher Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Mobile Number *
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobile(value);
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
              <p className="text-sm text-gray-500 mt-1">
                Teacher will login with this mobile number (no password required initially)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !mobile || mobile.length !== 10}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Teacher'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Teacher Creation Process:</h3>
        <ol className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-medium">1.</span>
            <span>Admin enters teacher's mobile number and creates account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">2.</span>
            <span>Teacher logs in with mobile number (no password needed initially)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">3.</span>
            <span>Teacher completes profile by setting name, password, and other details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">4.</span>
            <span>Future logins require mobile number + password</span>
          </li>
        </ol>
      </div>

      {/* Teacher Login Instructions */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          For Teachers:
        </h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• First time: Login with mobile number only (no password)</li>
          <li>• Complete your profile with name, password, and subject details</li>
          <li>• After setup: Login with mobile number + password</li>
          <li>• You can change your password anytime from your dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminTeacherManagement;
