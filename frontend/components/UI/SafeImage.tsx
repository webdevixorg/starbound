'use client';

import React, { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import { getImageSrc, preloadImage } from '@/utils/imageUtils';
import { getOptimizedImageUrl } from '@/services/images';

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
  fallback = '/images/placeholders/300x300.jpg',
  baseUrl,
  priority = false,
  sizes,
  contentType,
  contentId,
  optimizedSize = 'medium',
  useOptimized = true,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const resolvedSrc = useMemo(() => {
    const originalSrc = getImageSrc(images, fallback, baseUrl);

    // If optimization is disabled or missing required data, use original
    if (
      !useOptimized ||
      !contentType ||
      !contentId ||
      originalSrc === fallback
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
    fallback,
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
      if (resolvedSrc === fallback) {
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
        setImageSrc(isValid ? resolvedSrc : fallback);
        setIsLoading(false);
      }
    };

    loadImage();
    return () => {
      isMounted = false;
    };
  }, [resolvedSrc, fallback]);

  const handleError = () => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  const imageProps = {
    src: imageSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-50' : ''}`,
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
