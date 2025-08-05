# Cloudinary Integration Guide

This project now supports Cloudinary for image storage and management. Follow these steps to set up and use Cloudinary for handling course images and other media uploads.

## 🚀 Quick Setup

### 1. Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After registration, go to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret

### 2. Configure Environment Variables
Add these variables to your `backend/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the placeholders with your actual Cloudinary credentials.

### 3. Install Dependencies (Already Done)
The following packages have been installed:
- `cloudinary` - Official Cloudinary SDK
- `multer` - File upload middleware
- `multer-storage-cloudinary` - Cloudinary storage for Multer

## 📁 File Structure

```
backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── routes/
│   ├── upload.js             # Image upload routes
│   └── courses.js            # Updated course routes with image support
└── models/
    └── Course.js             # Updated with imagePublicId field

frontend/
├── components/
│   ├── CreateCourseModal.tsx # Updated with file upload
│   └── ImageUpload.tsx       # Reusable image upload component
```

## 🔧 Backend Features

### Upload Routes (`/api/upload`)
- `POST /api/upload/course` - Upload course images (Admin only)
- `POST /api/upload/profile` - Upload profile images (Authenticated users)
- `POST /api/upload/current-affairs` - Upload current affairs images (Admin only)
- `DELETE /api/upload/:publicId` - Delete images (Admin only)

### Course Routes (Updated)
- `POST /api/courses` - Create course with image upload
- `PUT /api/courses/:id` - Update course with optional image update
- `DELETE /api/courses/:id` - Delete course and associated image

### Image Management Features
- **Automatic Optimization**: Images are automatically optimized for web
- **Multiple Formats**: Supports JPEG, PNG, WebP
- **Size Limits**: Configurable file size limits (5MB for courses, 2MB for profiles)
- **Automatic Deletion**: Old images are deleted when updating or removing courses
- **Folder Organization**: Images are organized in folders (`iasdesk/courses`, `iasdesk/profiles`, etc.)

## 🎨 Frontend Features

### CreateCourseModal (Updated)
Now supports file upload instead of URL input:
- Drag & drop file upload
- Image preview before upload
- File validation (type and size)
- Progress indication during upload

### ImageUpload Component
Reusable component for any image upload needs:
```tsx
import ImageUpload from '../components/ImageUpload';

<ImageUpload
  label="Course Image"
  preview={imagePreview}
  onFileChange={handleFileChange}
  onRemove={handleRemove}
  maxSize={5}
  disabled={loading}
/>
```

## 📝 Usage Examples

### Creating a Course with Image
```javascript
// Frontend (FormData)
const formData = new FormData();
formData.append('title', 'Course Title');
formData.append('description', 'Course Description');
formData.append('price', '999');
formData.append('category', 'UPSC');
formData.append('image', imageFile); // File object

fetch('/api/courses', {
  method: 'POST',
  headers: { 'x-admin-token': adminToken },
  body: formData
});
```

### Direct Image Upload
```javascript
// Upload image separately
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/upload/course', {
  method: 'POST',
  headers: { 'x-admin-token': adminToken },
  body: formData
});

const { data } = await response.json();
console.log('Image URL:', data.imageUrl);
console.log('Public ID:', data.publicId);
```

## 🔐 Security Features

- **Authentication Required**: All upload endpoints require proper authentication
- **File Type Validation**: Only image files are accepted
- **Size Limits**: Configurable file size limits prevent abuse
- **Admin Only**: Sensitive operations (course images, deletion) require admin privileges
- **Public ID Management**: Secure deletion using Cloudinary public IDs

## 🎯 Image Transformations

Cloudinary automatically applies optimizations:

### Course Images
- Dimensions: 800x450px
- Crop: Fill
- Quality: Auto
- Format: Auto (WebP when supported)

### Profile Images
- Dimensions: 200x200px
- Crop: Fill with circular border
- Quality: Auto

### Current Affairs Images
- Dimensions: 600x400px
- Crop: Fill
- Quality: Auto

## 🚀 Benefits of Cloudinary Integration

1. **Performance**: Automatic image optimization and CDN delivery
2. **Storage**: No local storage needed, scales automatically
3. **Formats**: Automatic format conversion (WebP, AVIF when supported)
4. **Responsive**: Easy to generate different sizes for responsive design
5. **Management**: Built-in image management and transformation APIs
6. **Cost-Effective**: Free tier supports up to 25GB storage and 25GB bandwidth

## 🛠️ Customization

### Adding New Upload Types
1. Add new storage configuration in `config/cloudinary.js`
2. Create new route in `routes/upload.js`
3. Update frontend components as needed

### Custom Transformations
Modify the transformation parameters in `config/cloudinary.js`:
```javascript
transformation: [
  { width: 1200, height: 600, crop: 'fill', quality: 'auto' },
  { overlay: 'watermark', opacity: 50 }
]
```

## 📊 Monitoring

Monitor your Cloudinary usage:
1. Log in to your Cloudinary Dashboard
2. Check usage statistics
3. Monitor transformation credits
4. Set up alerts for quota limits

## 🔧 Troubleshooting

### Common Issues

1. **Upload fails**: Check environment variables and Cloudinary credentials
2. **Large file sizes**: Verify file size limits and adjust if needed
3. **Invalid file types**: Ensure only image files are being uploaded
4. **Permission errors**: Verify admin authentication is working

### Debug Mode
Enable debug logging in development:
```javascript
// In cloudinary.config
cloudinary.config({
  // ... other config
  secure: true,
  debug: process.env.NODE_ENV === 'development'
});
```

This integration provides a robust, scalable solution for image management in your educational platform!
