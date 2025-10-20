/**
 * Utility functions for checking image optimization status and URLs
 */

import { getOptimizedImageUrl } from '@/services/images';

/**
 * Check if an optimized version of an image exists
 * @param originalFilename - Original image filename
 * @param size - Size to check
 * @param contentType - Content type
 * @param contentId - Content ID
 * @returns Promise<boolean> - Whether the optimized version exists
 */
export const checkOptimizedImageExists = async (
  originalFilename: string,
  size: 'thumb' | 'medium' | 'full',
  contentType: string,
  contentId: number
): Promise<boolean> => {
  try {
    const optimizedUrl = getOptimizedImageUrl(
      originalFilename,
      size,
      contentType,
      contentId
    );
    const response = await fetch(optimizedUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Failed to check optimized image existence: ${error}`);
    return false;
  }
};

/**
 * Get the best available image URL, falling back to smaller sizes or original if optimized versions don't exist
 * @param originalFilename - Original image filename
 * @param preferredSize - Preferred size
 * @param contentType - Content type
 * @param contentId - Content ID
 * @returns Promise<string> - Best available image URL
 */
export const getBestAvailableImageUrl = async (
  originalFilename: string,
  preferredSize: 'thumb' | 'medium' | 'full',
  contentType: string,
  contentId: number
): Promise<string> => {
  const sizePriority: Array<'thumb' | 'medium' | 'full'> =
    preferredSize === 'thumb'
      ? ['thumb', 'medium', 'full']
      : preferredSize === 'medium'
        ? ['medium', 'full', 'thumb']
        : ['full', 'medium', 'thumb'];

  // Try to find an available optimized version
  for (const size of sizePriority) {
    const exists = await checkOptimizedImageExists(
      originalFilename,
      size,
      contentType,
      contentId
    );
    if (exists) {
      return getOptimizedImageUrl(
        originalFilename,
        size,
        contentType,
        contentId
      );
    }
  }

  // Fall back to original image
  const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = `${contentType}s`;
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${contentId}/${originalFilename}`;
};

/**
 * Preload optimized images for better performance
 * @param originalFilename - Original image filename
 * @param contentType - Content type
 * @param contentId - Content ID
 * @param sizes - Sizes to preload (default: all)
 */
export const preloadOptimizedImages = (
  originalFilename: string,
  contentType: string,
  contentId: number,
  sizes: Array<'thumb' | 'medium' | 'full'> = ['thumb', 'medium', 'full']
): void => {
  sizes.forEach((size) => {
    try {
      const url = getOptimizedImageUrl(
        originalFilename,
        size,
        contentType,
        contentId
      );
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    } catch (error) {
      console.warn(`Failed to preload ${size} image:`, error);
    }
  });
};
