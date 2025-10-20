import { supabase } from './supabase';
import axiosInstance from './AxiosInstance';
import axios, { AxiosResponse } from 'axios';
import { Image } from '@/types/types'; // Adjust the import path as necessary
import axiosInstanceNoAuth from './AxiosInstanceNoAuth';

// Allowed image extensions
const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const mimeToExt: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export async function uploadImage(
  file: File,
  title: string,
  contentType: string,
  contentId: number
) {
  // Ensure 'file' is a native File or Blob
  const fileToUpload = file instanceof File ? file : file;

  // Get extension safely
  let fileExt = '';
  if (
    fileToUpload.name &&
    typeof fileToUpload.name === 'string' &&
    fileToUpload.name.includes('.')
  ) {
    fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || '';
  }
  if (!allowedExts.includes(fileExt)) {
    fileExt = mimeToExt[fileToUpload.type] || 'png';
  }

  // Create a unique filename using timestamp + random string
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileName = `${timestamp}_${randomString}`;

  // Convert file to base64 for Django
  const arrayBuffer = await fileToUpload.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert to base64 efficiently without spreading large arrays
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64Data = btoa(binaryString);

  try {
    // Send to Django for optimization and upload
    const optimizeResponse = await axiosInstance.post('/images/optimize/', {
      image_data: base64Data,
      filename: fileName,
      content_type: contentType,
      content_id: contentId,
    });

    if (optimizeResponse.data.status === 'success') {
      const { uploaded_images } = optimizeResponse.data;

      console.log(
        `Successfully uploaded ${Object.keys(uploaded_images).length} image versions:`,
        uploaded_images
      );

      return {
        url: fileName, // Save without extension in database
        title,
        contentId,
        originalName: fileToUpload.name,
        optimizedVersions: uploaded_images,
      };
    } else {
      throw new Error('Image optimization and upload failed');
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error(
      `Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export const saveImageUrlToDB = async (
  url: string,
  title: string,
  id: number,
  type: number,
  order: number
) => {
  const payload = {
    image_path: url, // Supabase public URL
    alt: title,
    object_id: id,
    order: order,
    content_type: type,
  };

  try {
    const response = await axiosInstance.post('/images/', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 201) {
      throw new Error('Image save failed');
    }

    return response.data;
  } catch (error) {
    console.error('Error saving image URL:', error);
    throw error;
  }
};

export const saveUserImageUrlToDB = async (
  url: string,
  title: string,
  id: number,
  type: number,
  order: number
) => {
  const payload = {
    image_path: url, // Supabase public URL
    alt: title,
    object_id: id,
    order: order,
    content_type: type,
  };

  try {
    const response = await axiosInstance.post('/images/user/', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 201) {
      throw new Error('Image save failed');
    }

    return response.data;
  } catch (error) {
    console.error('Error saving image URL:', error);
    throw error;
  }
};

export const fetchImagesByObjectId = async (
  objectId: number
): Promise<Image> => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.get('/images/', {
      params: {
        object_id: objectId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching image by object ID:', error);
    throw error;
  }
};

// Function to update the image order
export const updateImage = async (imageId: number, data: { order: number }) => {
  try {
    // Add a small delay to prevent rapid duplicate calls
    const updateKey = `update_${imageId}_${data.order}`;
    const lastUpdate = sessionStorage.getItem(updateKey);
    const now = Date.now();

    // Prevent duplicate calls within 1 second
    if (lastUpdate && now - parseInt(lastUpdate) < 1000) {
      console.log(`Skipping duplicate update for image ${imageId}`);
      return { status: 'skipped', reason: 'duplicate_call_prevention' };
    }

    sessionStorage.setItem(updateKey, now.toString());

    const response = await axiosInstance.patch(
      `/images/${imageId}/update/`,
      data
    );

    // Clean up the session storage after successful update
    sessionStorage.removeItem(updateKey);

    return response.data;
  } catch (error) {
    console.error(`Error updating order for image ${imageId}:`, error);
    throw error;
  }
};

export const deleteImage = async (
  objectId: number,
  imageId: number,
  contentType: string,
  supabasePath?: string
) => {
  try {
    // 1. Delete from Django backend
    const response = await axiosInstance.delete(`/images/${imageId}/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 204) {
      throw new Error('Image deletion failed');
    }

    // 2. Delete from Supabase Storage if path is provided
    if (supabasePath) {
      const { error } = await supabase.storage
        .from(`${contentType}s`)
        .remove([`${objectId}/${supabasePath}`]);
      console.log('Test delete error:', error);

      if (error) {
        console.error('Error deleting image from Supabase:', error.message);
        // Optionally, throw error or handle gracefully
      }
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Error deleting image:',
        error.response?.data || error.message
      );
    } else {
      console.error('Unexpected error deleting image:', error);
    }
    throw error;
  }
};

/**
 * Get optimized image URL for a specific size
 * @param originalUrl - Image filename without extension (e.g., "1234567890_abc123")
 * @param size - Size variant ('thumb', 'medium', 'full')
 * @param contentType - Content type for bucket ('product', 'post', etc.)
 * @param contentId - Content ID for folder
 * @returns Optimized image URL or original if optimized version doesn't exist
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  size: 'thumb' | 'medium' | 'full',
  contentType: string,
  contentId: number
): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = `${contentType}s`;

  // Since originalUrl is now stored without extension, just add the suffix and .webp
  const optimizedFilename = `${originalUrl}_${size}.webp`;

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${contentId}/${optimizedFilename}`;
};

/**
 * Get all available image sizes for responsive images
 * @param originalUrl - Image filename without extension
 * @param contentType - Content type for bucket
 * @param contentId - Content ID for folder
 * @returns Object with URLs for all sizes
 */
export const getResponsiveImageUrls = (
  originalUrl: string,
  contentType: string,
  contentId: number
) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = `${contentType}s`;
  // For original, we'll default to the medium version since we don't store original files
  const originalFullUrl = getOptimizedImageUrl(
    originalUrl,
    'medium',
    contentType,
    contentId
  );

  return {
    thumb: getOptimizedImageUrl(originalUrl, 'thumb', contentType, contentId),
    medium: getOptimizedImageUrl(originalUrl, 'medium', contentType, contentId),
    full: getOptimizedImageUrl(originalUrl, 'full', contentType, contentId),
    original: originalFullUrl,
  };
};
