import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface Instructor {
  name: string;
  bio: string;
  imageURL?: string;
}

interface LiveSession {
  _id: string;
  date: string;
  time: string;
  meetLink: string;
  title: string;
  isActive: boolean;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  level: string;
  duration: string;
  features: string[];
  imageURL: string;
  enrollmentCount: number;
  rating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  meetLink?: string;
  videoURL?: string;
  instructor?: Instructor;
  meetSchedule?: {
    dailyTime: string;
    timezone: string;
    isActive: boolean;
  };
  liveSessions?: LiveSession[];
}

interface CourseEditModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCourse: Course) => void;
}

const CourseEditModal: React.FC<CourseEditModalProps> = ({
  course,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    level: 'Beginner',
    duration: '',
    features: [''],
    imageURL: '',
    isActive: true,
    meetLink: '',
    videoURL: '',
    instructor: {
      name: '',
      bio: '',
      imageURL: ''
    }
  });
  
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || 0,
        originalPrice: course.originalPrice || 0,
        category: course.category || '',
        level: course.level || 'Beginner',
        duration: course.duration || '',
        features: course.features?.length > 0 ? course.features : [''],
        imageURL: course.imageURL || '',
        isActive: course.isActive,
        meetLink: course.meetLink || '',
        videoURL: course.videoURL || '',
        instructor: {
          name: course.instructor?.name || '',
          bio: course.instructor?.bio || '',
          imageURL: course.instructor?.imageURL || ''
        }
      });
    }
  }, [course]);

  const getApiUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      console.warn('REACT_APP_API_URL not set, using default localhost:5000');
      return 'http://localhost:5000/api';
    }
    return apiUrl;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.originalPrice && formData.originalPrice < formData.price) {
      newErrors.originalPrice = 'Original price must be greater than or equal to current price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${getApiUrl()}/admin/courses/${course._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter(feature => feature.trim() !== '')
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Course updated successfully');
          onUpdate(data.data.course);
          onClose();
        } else {
          toast.error(data.message || 'Failed to update course');
        }
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter course title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter course description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  <option value="UPSC">UPSC</option>
                  <option value="Current Affairs">Current Affairs</option>
                  <option value="Test Series">Test Series</option>
                  <option value="Interview Prep">Interview Prep</option>
                  <option value="Optional Subjects">Optional Subjects</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 6 months, 120 hours"
              />
            </div>
          </div>

          {/* Course Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Features</h3>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter feature"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add Feature
            </button>
          </div>

          {/* Media and Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Media & Links</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Image URL
              </label>
              <input
                type="url"
                value={formData.imageURL}
                onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meet Link
              </label>
              <input
                type="url"
                value={formData.meetLink}
                onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                type="url"
                value={formData.videoURL}
                onChange={(e) => setFormData({ ...formData, videoURL: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Course is active and available for enrollment
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {updating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditModal;
