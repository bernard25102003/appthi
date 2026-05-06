# Image Upload Feature - Implementation Guide

## Overview

The product management feature has been updated to support **drag-and-drop** and **file selection** for image uploads, with built-in integration for **ImageKit** cloud storage.

## Key Features

✅ **Drag-and-Drop Support** - Users can drag multiple image files directly onto the upload area
✅ **File Selection** - Click to select images from device
✅ **Multiple Image Upload** - Add multiple images to a single product
✅ **Real-time Preview** - See image previews before saving
✅ **ImageKit Integration** - Upload images to ImageKit cloud storage
✅ **Fallback Support** - Works with local blob URLs if ImageKit isn't configured
✅ **Error Handling** - Graceful error messages and fallbacks

## File Structure

```
admin-client/src/app/
├── pages/
│   └── Products.tsx              (Updated with new upload UI)
├── utils/
│   ├── imagekit.ts              (ImageKit upload helper)
│   └── IMAGEKIT_BACKEND_SETUP.ts (Backend integration examples)
└── data/
    └── mockData.ts              (Product data)
```

## Changes Made

### 1. Products.tsx
- Replaced URL input fields with file input and drag-drop area
- Added `ImageFile` interface to store file + preview URL pairs
- Implemented drag-and-drop handlers
- Added upload progress indication with loading state
- Integrated ImageKit upload functionality

### 2. imagekit.ts (New Utility)
```typescript
// Main functions:
uploadToImageKit(file, folder)           // Upload single file
uploadMultipleToImageKit(files, folder) // Upload multiple files
deleteFromImageKit(fileId)               // Delete file from ImageKit
getImageKitUrl(path, options)            // Get optimized image URLs
```

## Setup Instructions

### Step 1: Get ImageKit Credentials

1. Sign up at [https://imagekit.io](https://imagekit.io)
2. Create a new project
3. Copy your credentials:
   - **Public Key**
   - **Private Key**
   - **URL Endpoint** (e.g., `https://your-endpoint.imagekit.io`)

### Step 2: Add Environment Variables

Create/update `.env` file in your admin-client project:

```env
# Frontend (.env or .env.local)
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key_here
VITE_IMAGEKIT_URL_ENDPOINT=https://your-endpoint.imagekit.io
```

Backend `.env`:
```env
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://your-endpoint.imagekit.io
```

### Step 3: Set Up Backend API Endpoint

Your backend needs to expose an `/api/upload` endpoint that:

**POST /api/upload**
- Accepts form data with `file`, `fileName`, and `folder` fields
- Authenticates with ImageKit using the private key
- Returns upload response with image URL and metadata

**DELETE /api/upload/:fileId**
- Deletes image from ImageKit by file ID
- Returns success status

See `IMAGEKIT_BACKEND_SETUP.ts` for example implementations in:
- Node.js + Express
- Python + Flask

### Step 4: Install ImageKit SDKs

**Backend (Node.js)**:
```bash
npm install imagekit
```

**Backend (Python)**:
```bash
pip install imagekitio
```

## Usage Examples

### Uploading Files in Products Component

The upload happens automatically when the form is submitted:

```typescript
// In ProductModal.handleSubmit()
try {
  const uploadedImages = await uploadMultipleToImageKit(
    imageFiles.map(img => img.file),
    'admin-products'
  );
  const imageUrls = uploadedImages.map(img => img.url);
} catch (error) {
  // Falls back to blob URLs automatically
}
```

### Getting Optimized Image URLs

```typescript
import { getImageKitUrl } from '../utils/imagekit';

// Get optimized image with transformations
const optimizedUrl = getImageKitUrl('/admin-products/image.jpg', {
  width: 300,
  height: 300,
  quality: 80,
  format: 'webp'
});
```

## UI Features

### Upload Area
- **Drag-Drop Zone**: Visual feedback when dragging files
- **Click to Browse**: Click anywhere to open file browser
- **Multiple Files**: Add multiple images at once
- **File Type Validation**: Only image files are accepted

### Image Preview
- **Grid Layout**: 4-column grid of image previews
- **Remove Button**: Hover to reveal remove button for each image
- **File Count**: Shows total number of images selected
- **Loading State**: Submit button shows loading animation during upload

## Error Handling

### Scenarios Covered

1. **ImageKit Not Configured**
   - Falls back to local blob URLs
   - Shows warning toast notification
   - Images still work locally

2. **Upload Failure**
   - Uses blob URLs as fallback
   - Shows error message
   - Allows retry

3. **Invalid Files**
   - Non-image files are rejected
   - Error toast shown for each invalid file

4. **Required Fields**
   - Validation errors shown for empty fields
   - Required fields marked with red asterisk

## Performance Considerations

### Image Optimization

ImageKit provides automatic optimization:
- Automatic format conversion (WebP for modern browsers)
- Responsive images
- Lazy loading support
- CDN delivery

### Fallback Mode

When ImageKit is unavailable:
- Uses browser blob URLs for preview
- Images stored as data URLs
- Works for local testing and development
- ⚠️ Note: Blob URLs don't persist across page refreshes or after closing browser

## Best Practices

1. **Image Size**: Keep image files under 5MB for best performance
2. **Format**: Use JPG, PNG, or GIF formats
3. **Quantity**: Upload 2-4 images per product for optimal user experience
4. **Naming**: Uploaded files get unique names to avoid conflicts

## Troubleshooting

### Images Not Uploading

**Check:**
- ImageKit environment variables are set correctly
- Backend `/api/upload` endpoint is accessible
- Backend can communicate with ImageKit API
- Network requests in browser DevTools

### Images Lost After Refresh

**Reason:** Using blob URLs (fallback mode)
**Solution:** Configure and set up ImageKit backend properly

### Upload Takes Too Long

**Check:**
- File size (keep under 5MB)
- Network connection
- Backend server performance

## Next Steps

1. ✅ Update Products.tsx component (DONE)
2. ✅ Create imagekit.ts utility (DONE)
3. ⏳ Set up backend `/api/upload` endpoint
4. ⏳ Add ImageKit environment variables
5. ⏳ Test upload functionality
6. ⏳ Deploy to production

## Support References

- [ImageKit Documentation](https://docs.imagekit.io/)
- [ImageKit SDK - Node.js](https://docs.imagekit.io/api-reference/upload-file-api/server-side-sdks#nodejs)
- [ImageKit SDK - Python](https://docs.imagekit.io/api-reference/upload-file-api/server-side-sdks#python)
