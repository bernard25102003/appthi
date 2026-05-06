// ImageKit Configuration & Upload Helper
// NOTE: Replace with your actual ImageKit credentials

const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';
const IMAGEKIT_PRIVATE_KEY = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || '';
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '';

interface UploadResponse {
  fileId: string;
  name: string;
  url: string;
  fileSize: number;
  height: number;
  width: number;
}

/**
 * Upload an image file to ImageKit
 * @param file - File object to upload
 * @param folder - Optional folder path in ImageKit
 * @returns Upload response with image URL and metadata
 */
export async function uploadToImageKit(
  file: File,
  folder: string = 'admin-products'
): Promise<UploadResponse> {
  // Check if ImageKit credentials are configured
  if (!IMAGEKIT_URL_ENDPOINT) {
    console.warn(
      'ImageKit is not configured. Please set VITE_IMAGEKIT_URL_ENDPOINT in .env'
    );
    throw new Error('ImageKit configuration is missing');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('folder', `/${folder}`);

  try {
    // This would call your backend API which handles the actual ImageKit upload
    // Your backend should authenticate with ImageKit using the private key
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data: UploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple image files to ImageKit
 * @param files - Array of File objects to upload
 * @param folder - Optional folder path in ImageKit
 * @returns Array of upload responses
 */
export async function uploadMultipleToImageKit(
  files: File[],
  folder: string = 'admin-products'
): Promise<UploadResponse[]> {
  const uploadPromises = files.map(file => uploadToImageKit(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from ImageKit
 * @param fileId - ImageKit file ID
 * @returns Success response
 */
export async function deleteFromImageKit(fileId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/upload/${fileId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw error;
  }
}

/**
 * Get optimized image URL from ImageKit
 * @param path - Image path in ImageKit
 * @param options - Image transformation options
 * @returns Optimized image URL
 */
export function getImageKitUrl(
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpg' | 'png' | 'webp';
  }
): string {
  if (!IMAGEKIT_URL_ENDPOINT) {
    console.warn('ImageKit is not configured');
    return path;
  }

  const params = new URLSearchParams();
  if (options?.width) params.append('w', options.width.toString());
  if (options?.height) params.append('h', options.height.toString());
  if (options?.quality) params.append('q', options.quality.toString());
  if (options?.format) params.append('f', options.format);

  const queryString = params.toString();
  const url = `${IMAGEKIT_URL_ENDPOINT}${path}`;
  return queryString ? `${url}?${queryString}` : url;
}
