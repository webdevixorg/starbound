'use client';

import React from 'react';
import SafeImage from './SafeImage';

interface ResponsiveImageProps {
  images?: { image_path: string }[];
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallback?: string;
  baseUrl?: string;
  priority?: boolean;
  contentType: string; // Required for optimization
  contentId: number; // Required for optimization
}

/**
 * ResponsiveImage component that automatically uses optimized image sizes
 * based on the container size and viewport.
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  images,
  alt,
  width,
  height,
  fill = false,
  className = '',
  fallback = '/images/placeholders/300x300.jpg',
  baseUrl,
  priority = false,
  contentType,
  contentId,
}) => {
  // Determine optimal size based on dimensions
  const getOptimalSize = (): 'thumb' | 'medium' | 'full' => {
    if (!width && !height) {
      return fill ? 'full' : 'medium';
    }

    const maxDimension = Math.max(width || 0, height || 0);

    if (maxDimension <= 200) {
      return 'thumb';
    } else if (maxDimension <= 400) {
      return 'medium';
    } else {
      return 'full';
    }
  };

  const optimalSize = getOptimalSize();

  // Generate responsive sizes attribute for Next.js Image
  const getSizesAttribute = (): string => {
    if (fill) {
      return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }

    if (width) {
      return `${width}px`;
    }

    // Default responsive sizes
    return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  return (
    <SafeImage
      images={images}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      fallback={fallback}
      baseUrl={baseUrl}
      priority={priority}
      sizes={getSizesAttribute()}
      contentType={contentType}
      contentId={contentId}
      optimizedSize={optimalSize}
      useOptimized={true}
    />
  );
};

export default ResponsiveImage;
