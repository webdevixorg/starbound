'use client';

import React, { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import { getImageSrc, preloadImage } from '@/utils/imageUtils';
import { getOptimizedImageUrl } from '@/services/images';

/**
 * Creates a dynamic shimmer placeholder SVG for any width and height
 * @param width - The width of the placeholder
 * @param height - The height of the placeholder
 * @returns SVG string with continuous shimmer animation
 */
export const createShimmerSVG = (
  width: number = 300,
  height: number = 300
): string => {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer-${width}-${height}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f3f4f6" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="100%" stop-color="#f3f4f6" stop-opacity="0.8"/>
          <animateTransform 
            attributeName="gradientTransform" 
            dur="1.5s" 
            repeatCount="indefinite" 
            type="translate" 
            values="-${width} 0; ${width} 0; -${width} 0"
          />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
      <rect width="${width}" height="${height}" fill="url(#shimmer-${width}-${height})"/>
    </svg>
  `.trim();
};

/**
 * Encodes SVG string to Base64 for use in data URLs
 * @param svgString - The SVG string to encode
 * @returns Base64 encoded data URL
 */
export const svgToBase64DataURL = (svgString: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side encoding
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  } else {
    // Server-side encoding (Node.js)
    return `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
  }
};

/**
 * Creates a complete shimmer placeholder data URL for any dimensions
 * @param width - The width of the placeholder
 * @param height - The height of the placeholder
 * @returns Complete data URL ready for use in img src or Next.js blurDataURL
 */
export const createShimmerDataURL = (
  width: number = 300,
  height: number = 300
): string => {
  const svg = createShimmerSVG(width, height);
  return svgToBase64DataURL(svg);
};

/**
 * Pre-built shimmer placeholders for common sizes
 */
export const SHIMMER_PLACEHOLDERS = {
  square: createShimmerDataURL(300, 300),
  landscape: createShimmerDataURL(400, 300),
  portrait: createShimmerDataURL(300, 400),
  wide: createShimmerDataURL(600, 300),
  thumbnail: createShimmerDataURL(150, 150),
  hero: createShimmerDataURL(1200, 600),
} as const;

interface SafeImageProps {
  images?: { image_path: string }[];
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallback?: string;
  baseUrl?: string;
  priority?: boolean;
  sizes?: string;
  // New props for optimization
  contentType?: string; // e.g., 'product', 'post'
  contentId?: number;
  optimizedSize?: 'thumb' | 'medium' | 'full' | 'original';
  useOptimized?: boolean;
}

interface SafeImageProps {
  images?: { image_path: string }[];
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallback?: string;
  baseUrl?: string;
  priority?: boolean;
  sizes?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({
  images,
  alt,
  width,
  height,
  fill = false,
  className = '',
  fallback,
  baseUrl,
  priority = false,
  sizes,
  contentType,
  contentId,
  optimizedSize = 'medium',
  useOptimized = true,
}) => {
  // Create dynamic fallback based on dimensions if not provided
  const dynamicFallback = useMemo(() => {
    if (fallback) return fallback;

    const fallbackWidth = width || 300;
    const fallbackHeight = height || 300;
    return createShimmerDataURL(fallbackWidth, fallbackHeight);
  }, [fallback, width, height]);
  const [imageSrc, setImageSrc] = useState<string>(dynamicFallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const resolvedSrc = useMemo(() => {
    const originalSrc = getImageSrc(images, dynamicFallback, baseUrl);

    // If optimization is disabled or missing required data, use original
    if (
      !useOptimized ||
      !contentType ||
      !contentId ||
      originalSrc === dynamicFallback
    ) {
      return originalSrc;
    }

    // Extract just the filename from the original src if it's a full URL
    let filename = originalSrc;
    if (originalSrc.includes('/')) {
      filename = originalSrc.split('/').pop() || originalSrc;
    }

    // Get optimized image URL
    if (optimizedSize === 'original') {
      return originalSrc;
    }

    try {
      return getOptimizedImageUrl(
        filename,
        optimizedSize,
        contentType,
        contentId
      );
    } catch (error) {
      console.warn(
        'Failed to generate optimized image URL, using original:',
        error
      );
      return originalSrc;
    }
  }, [
    images,
    dynamicFallback,
    baseUrl,
    useOptimized,
    contentType,
    contentId,
    optimizedSize,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      setIsLoading(true);

      // If it's already the fallback, no need to validate
      if (resolvedSrc === dynamicFallback) {
        if (isMounted) {
          setImageSrc(resolvedSrc);
          setIsLoading(false);
        }
        return;
      }

      // Skip preload validation for placeholder images to avoid browser warnings
      if (
        resolvedSrc.includes('placeholder') ||
        resolvedSrc.includes('/images/placeholders/')
      ) {
        if (isMounted) {
          setImageSrc(resolvedSrc);
          setIsLoading(false);
        }
        return;
      }

      const isValid = await preloadImage(resolvedSrc);
      if (isMounted) {
        setImageSrc(isValid ? resolvedSrc : dynamicFallback);
        setIsLoading(false);
      }
    };

    loadImage();
    return () => {
      isMounted = false;
    };
  }, [resolvedSrc, dynamicFallback]);

  const handleError = () => {
    if (imageSrc !== dynamicFallback) {
      setImageSrc(dynamicFallback);
    }
  };

  const imageProps = {
    src: imageSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-50' : ''} ${
      imageSrc === dynamicFallback ||
      imageSrc.includes('placeholder') ||
      imageSrc.includes('/images/placeholders/') ||
      imageSrc.includes('data:image/svg+xml')
        ? 'object-cover'
        : 'object-contain'
    }`,
    onError: handleError,
    priority:
      priority &&
      !imageSrc.includes('placeholder') &&
      !imageSrc.includes('/images/placeholders/'),
    // When fill is true, provide appropriate sizes based on context
    sizes:
      fill && !sizes
        ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
        : sizes,
    // Handle dimensions properly to avoid Next.js warnings
    ...(fill
      ? { fill: true }
      : {
          width: width || 300, // Default width if not provided
          height: height || 300, // Default height if not provided
        }),
  };

  // If fill is used, wrap in a relatively positioned container
  if (fill) {
    return <NextImage {...imageProps} />;
  }

  return <NextImage {...imageProps} />;
};

export default SafeImage;
