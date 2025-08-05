import React from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  preview: string;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  preview,
  onFileChange,
  onRemove,
  disabled = false,
  accept = "image/*",
  maxSize = 5,
  className = ""
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Image size should be less than ${maxSize}MB`);
        return;
      }

      onFileChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    onRemove();
    // Clear the input
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
        <div className="space-y-1 text-center">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto h-32 w-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
          )}
          
          <div className="flex text-sm text-gray-600">
            <label 
              htmlFor="image-upload" 
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <span>{preview ? 'Change image' : 'Upload an image'}</span>
              <input
                id="image-upload"
                name="image-upload"
                type="file"
                accept={accept}
                className="sr-only"
                onChange={handleFileChange}
                disabled={disabled}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          
          <p className="text-xs text-gray-500">
            PNG, JPG, WEBP up to {maxSize}MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
