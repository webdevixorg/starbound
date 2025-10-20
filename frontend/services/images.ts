import { ImageFile } from '@/types/types';
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

  // Unique file name and path (by content type)
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${contentId}/${fileName}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(`${contentType}s`)
    .upload(filePath, fileToUpload, { upsert: false });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(error.message);
  }

  return {
    url: fileName,
    title,
    contentId,
    originalName: fileToUpload.name,
  };
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
    const response = await axiosInstance.patch(`/images/${imageId}`, data);
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
    const response = await axiosInstance.delete(`/images/${imageId}`, {
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
