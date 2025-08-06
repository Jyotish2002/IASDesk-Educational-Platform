import React, { useState } from 'react';
import { X, BookOpen, DollarSign, Tag, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: () => void;
}

interface CourseData {
  title: string;
  description: string;
  price: string;
  category: string;
  imageFile: File | null;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ isOpen, onClose, onCourseCreated }) => {
  const [formData, setFormData] = useState<CourseData>({
    title: '',
    description: '',
    price: '',
    category: '',
    imageFile: null
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = [
    // UPSC Categories
    'UPSC',
    'UPSC Prelims',
    'UPSC Mains',
    'UPSC Interview',
    'UPSC Optional',
    
    // Class Categories
    'Class 5-12',
    'Class 5-8',
    'Class 9-10',
    'Class 11-12 Science',
    'Class 11-12 Commerce',
    
    // Other Competitive Exams
    'SSC',
    'SSC Exams',
    'Banking',
    'State PSC',
    'JEE & NEET',
    
    // General Categories
    'General Knowledge'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setLoading(true);

    try {
      console.log('=== COURSE CREATION DEBUG ===');
      console.log('Using admin authentication for course creation');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      
      console.log('Form data being sent:');
      console.log('- Title:', formData.title.trim());
      console.log('- Description:', formData.description.trim());
      console.log('- Price:', formData.price);
      console.log('- Category:', formData.category);
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
        console.log('- Image file:', formData.imageFile.name, 'Size:', formData.imageFile.size);
      } else {
        console.log('- No image file selected');
      }

      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };

      console.log('Making request to create course with headers:', headers);
      console.log('Request URL: https://iasdesk-educational-platform-2.onrender.com/api/admin/courses');
      console.log('Request method: POST');

      const response = await fetch('https://iasdesk-educational-platform-2.onrender.com/api/admin/courses', {
        method: 'POST',
        headers,
        body: formDataToSend // Don't set Content-Type, let browser set it for FormData
      });

      console.log('Response received:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- OK:', response.ok);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('Response not OK. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        toast.success('Course created successfully!');
        setFormData({
          title: '',
          description: '',
          price: '',
          category: '',
          imageFile: null
        });
        setImagePreview('');
        onCourseCreated();
        onClose();
      } else {
        console.error('Course creation failed:', data);
        const errorMessage = typeof data.message === 'string' 
          ? data.message 
          : `Failed to create course: ${response.status} ${response.statusText}`;
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Create course error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Network error: Failed to create course. Please check your connection and try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
              <p className="text-sm text-gray-600">Add a new course to the platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Course Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter course title"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Course Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter detailed course description"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Price (₹) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 appearance-none"
                  required
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Course Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Image (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Course preview"
                      className="mx-auto h-32 w-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, imageFile: null }));
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>{imagePreview ? 'Change image' : 'Upload an image'}</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
