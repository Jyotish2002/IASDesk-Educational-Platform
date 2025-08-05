# Testimonials Management Guide

## Overview
Testimonials are now managed through a centralized data file for easy updates and maintenance.

## File Locations

### Data File
- **Location:** `src/data/testimonials.ts`
- **Purpose:** Contains all testimonial data including names, images, quotes, and verification status

### Images Folder
- **Location:** `public/images/testimonials/`
- **Purpose:** Stores all testimonial profile images

## How to Add/Update Testimonials

### Step 1: Add Image
1. Prepare your image:
   - Format: JPG, PNG, or WebP
   - Size: 80x80 pixels (square, recommended)
   - File size: Under 100KB
   - Professional quality

2. Save the image in: `public/images/testimonials/`
   - Use naming convention: `firstname-lastname.jpg`
   - Example: `priya-sharma.jpg`

### Step 2: Update Data File
1. Open `src/data/testimonials.ts`
2. Add new testimonial object:

```typescript
{
  id: 6, // Next available ID
  name: 'Student Name',
  exam: 'Exam/Achievement',
  image: '/images/testimonials/student-name.jpg',
  quote: 'Student testimonial quote here...',
  year: '2024',
  verified: true
}
```

### Step 3: Image Requirements
- **Dimensions:** 80x80px minimum (will be displayed as 64x64px)
- **Aspect Ratio:** 1:1 (square)
- **Format:** JPG preferred (PNG/WebP also supported)
- **Quality:** High resolution, clear face
- **File Size:** Under 100KB for optimal loading

## Current Testimonials

### Active on Homepage
The homepage displays the first 3 testimonials from the data file.

### All Available Testimonials
1. **Priya Sharma** - IAS Rank 15
2. **Rahul Kumar** - UPSC CSE Rank 42
3. **Anjali Patel** - Class 12 CBSE 96%
4. **Vikash Singh** - SSC CGL 2024
5. **Sneha Gupta** - Banking PO 2024

## Image Upload Steps

### Method 1: Direct Upload
1. Navigate to: `c:\Users\jyoti\Desktop\IASDesk\frontend\public\images\testimonials\`
2. Copy your image files with proper naming
3. Update the testimonials.ts file with correct image paths

### Method 2: Batch Upload
1. Prepare all images in a folder
2. Rename them according to the naming convention
3. Copy all files to the testimonials folder at once
4. Update the data file with all new entries

## Best Practices

### Image Guidelines
- Use professional headshots or student photos
- Ensure good lighting and clear visibility
- Compress images to reduce file size
- Use consistent aspect ratios

### Content Guidelines
- Get proper consent from students before using their testimonials
- Verify all achievements and ranks mentioned
- Keep quotes authentic and genuine
- Include recent years for credibility

### Technical Notes
- Images are served from the public folder (no build step required)
- The testimonials data is imported as a TypeScript module
- Homepage automatically displays first 3 testimonials
- Easy to extend for testimonials page or carousel

## Troubleshooting

### Image Not Loading
1. Check file path spelling in testimonials.ts
2. Verify image exists in public/images/testimonials/
3. Ensure image file extension matches the path
4. Clear browser cache and refresh

### Adding More Testimonials
1. Add new entries to testimonials.ts
2. Increment the ID for each new testimonial
3. Upload corresponding images
4. Test on localhost before deploying

## Future Enhancements

### Potential Features
- Admin panel for testimonial management
- Image upload interface
- Testimonial approval workflow
- Category-wise testimonials (UPSC, Banking, etc.)
- Testimonial carousel on homepage
- Video testimonials support

### Database Integration
Consider moving testimonials to a database for:
- Dynamic content management
- User submission forms
- Admin approval workflow
- Better SEO with dynamic meta tags
