import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Image, ImageFile } from '../../../types/types';
import placeholderImage from '../../../assets/images/image_placeholder.jpg';

interface FeaturedImageUploadProps {
  setSelectedFiles: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  galleryImages: Image[];
  setGalleryImages: React.Dispatch<React.SetStateAction<Image[]>>;
  setDeletedImages: React.Dispatch<React.SetStateAction<Image[]>>;
}

const FeaturedImageUpload: React.FC<FeaturedImageUploadProps> = ({
  setSelectedFiles,
  galleryImages,
  setGalleryImages,
  setDeletedImages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [featuredImage, setFeaturedImage] = useState<Image[]>([]);

  useEffect(() => {
    const featured = galleryImages.filter((image) => image.order === 1);
    setFeaturedImage(featured);
  }, [galleryImages]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      if (file) {
        const imageFile: ImageFile = { file, order: 1 };
        setSelectedFiles([imageFile]);
        const imageUrl = URL.createObjectURL(file);
        const newImage: Image = {
          id: galleryImages.length, // Temporary ID for new image
          image_path: imageUrl,
          alt: file.name,
          order: 1,
        };
        setFeaturedImage([newImage]);
        setGalleryImages((prevImages) => [...prevImages, newImage]);
      }
    },
    [setSelectedFiles, setGalleryImages, galleryImages]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveImage = useCallback(() => {
    if (featuredImage.length > 0) {
      const imageToRemove = featuredImage[0];
      const updatedImages = galleryImages.filter(
        (image) => image.image_path !== imageToRemove.image_path
      );
      setGalleryImages(updatedImages);
      setDeletedImages((prevImages) => [
        ...prevImages,
        ...galleryImages.filter(
          (image) => image.image_path === imageToRemove.image_path
        ),
      ]);
      setFeaturedImage([]);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [
    featuredImage,
    galleryImages,
    setDeletedImages,
    setGalleryImages,
    setSelectedFiles,
  ]);

  return (
    <div>
      <div className="widget-content">
        <img
          src={featuredImage[0]?.image_path || placeholderImage}
          alt={featuredImage.length > 0 ? 'Selected' : 'Placeholder'}
          className="w-full h-auto"
        />
      </div>
      <div className="widget-footer bg-gray-200">
        <div className="flex items-center justify-between text-lg font-semibold bg-gray-200 p-2">
          {featuredImage.length > 0 ? (
            <>
              <button
                type="button"
                onClick={handleClick}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 focus:outline-none focus:shadow-outline"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 focus:outline-none focus:shadow-outline"
              >
                Remove
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClick}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 focus:outline-none focus:shadow-outline"
            >
              Add Image
            </button>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FeaturedImageUpload;
