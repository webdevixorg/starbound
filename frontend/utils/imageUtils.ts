/**
 * Utility functions for handling image URLs and loading
 */

/**
 * Validates if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    // Check if it's a valid URL
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    // If it's a relative path, check if it starts with /
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
};

/**
 * Normalizes image URL to ensure proper loading
 */
export const normalizeImageUrl = (url: string, baseUrl?: string): string => {
  if (!url) return '/placeholder-product.png';

  // Clean up the URL - remove any malformed parts
  let cleanUrl = url.trim();

  // Fix common malformed URL patterns
  if (
    cleanUrl.includes('httpove-') ||
    (cleanUrl.includes('http') && !cleanUrl.startsWith('http'))
  ) {
    console.warn('Detected malformed URL:', cleanUrl);
    // Try to extract a valid part or return fallback
    const httpIndex = cleanUrl.indexOf('http');
    if (httpIndex > -1) {
      cleanUrl = cleanUrl.substring(httpIndex);
    } else {
      return '/placeholder-product.png';
    }
  }

  // If it's already a valid absolute URL, return as is
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // If it's a relative path starting with /, return as is
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }

  // If we have a base URL, construct the full URL
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, '')}/${cleanUrl.replace(/^\//, '')}`;
  }

  // Default to treating it as a relative path
  return `/${cleanUrl.replace(/^\//, '')}`;
};

/**
 * Gets the image source with fallback
 */
export const getImageSrc = (
  images: { image_path: string }[] | undefined,
  fallback: string = '/placeholder-product.png',
  baseUrl?: string
): string => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback;
  }

  const firstImage = images[0];
  if (!firstImage || !firstImage.image_path) {
    return fallback;
  }

  const normalizedUrl = normalizeImageUrl(firstImage.image_path, baseUrl);

  // Additional validation to ensure the URL is properly formed
  if (!isValidImageUrl(normalizedUrl)) {
    return fallback;
  }

  return normalizedUrl;
};

/**
 * Preloads an image to check if it's valid
 * Optimized to avoid unnecessary preloading of placeholder images
 */
export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Skip preload validation for placeholder images to avoid browser warnings
    if (src.includes('placeholder') || src.includes('/images/placeholders/')) {
      resolve(true);
      return;
    }

    const img = new Image();

    // Add timeout to prevent hanging promises
    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000); // 5 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.src = src;
  });
};
