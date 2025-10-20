import React, { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import { getImageSrc, preloadImage } from '@/utils/imageUtils';

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
}) => {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const resolvedSrc = useMemo(
    () => getImageSrc(images, fallback, baseUrl),
    [images, fallback, baseUrl]
  );

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
    className: `${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity`,
    onError: handleError,
    priority,
    // When fill is true, provide appropriate sizes based on context
    sizes:
      fill && !sizes
        ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
        : sizes,
    ...(fill ? { fill: true } : { width, height }),
  };

  // If fill is used, wrap in a relatively positioned container
  if (fill) {
    return (
      <div className="relative w-full h-full">
        <NextImage {...imageProps} />
      </div>
    );
  }

  return <NextImage {...imageProps} />;
};

export default SafeImage;
