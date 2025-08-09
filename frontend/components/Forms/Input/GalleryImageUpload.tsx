import React, { useRef, useCallback } from 'react';
import NextImage from 'next/image';
import { Image, ImageFile } from '@/types/types';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getPublicImageUrl } from '@/helpers/media';

interface ImageUploadProps {
  setSelectedFiles: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  galleryImages: Image[];
  setGalleryImages: React.Dispatch<React.SetStateAction<Image[]>>;
  setDeletedImages: React.Dispatch<React.SetStateAction<Image[]>>;
  contentType: string;
}

const ItemType = {
  IMAGE: 'image',
};

const DraggableImage: React.FC<{
  image: Image;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  handleRemoveImage: (index: number) => void;
  contentType: string;
}> = ({ image, index, moveImage, handleRemoveImage, contentType }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemType.IMAGE,
    hover(item: { index: number }) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.IMAGE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="relative h-full w-full cursor-pointer"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <NextImage
        src={
          image.object_id === 0
            ? image.image_path
            : getPublicImageUrl(contentType, image.object_id, image.image_path)
        }
        alt={image.alt}
        sizes="(max-width: 640px) 100vw, 640px"
        fill
        className="object-cover rounded"
        priority={index === 0}
      />

      <button
        onClick={() => handleRemoveImage(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  setSelectedFiles,
  galleryImages,
  setGalleryImages,
  setDeletedImages,
  contentType = 'posts', // Default content type, can be overridden
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createUniqueImageList = (images: Image[]) => {
    const uniqueImages = new Map<number, Image>();
    images.forEach((image) => {
      uniqueImages.set(image.id, image);
    });
    return Array.from(uniqueImages.values());
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      const imageFiles: ImageFile[] = files.map((file, index) => ({
        file,
        order: galleryImages.length + index + 1, // Ensure unique order starting from the next available position
        type: file.type,
        name: file.name,
      }));
      setSelectedFiles((prevFiles) => [...prevFiles, ...imageFiles]);

      const newImages = files.map((file) => ({
        id: 0, // Temporary ID for new images
        image_path: URL.createObjectURL(file),
        alt: file.name,
        object_id: 0, // Temporary object_id for new images
        order: galleryImages.length + 1, // Ensure unique order starting from the next available position
      }));

      const combinedImages = [...galleryImages, ...newImages];
      const updatedImages = combinedImages.map((image, index) => ({
        ...image,
        order: index + 1, // Reassign order to be sequential starting from 1
      }));

      setGalleryImages(updatedImages);
    },
    [setSelectedFiles, setGalleryImages, galleryImages]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveImageInternal = useCallback(
    (index: number) => {
      const imageToRemove = galleryImages[index];
      const updatedImages = galleryImages
        .filter((_, i) => i !== index)
        .map((image, idx) => ({
          ...image,
          order: idx + 1, // Reassign order to be sequential starting from 1
        }));
      setGalleryImages(createUniqueImageList(updatedImages));
      setDeletedImages((prevImages) => {
        const newDeletedImages = [...prevImages, imageToRemove];
        return newDeletedImages;
      });
    },
    [galleryImages, setGalleryImages, setDeletedImages]
  );

  const moveImage = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragImage = galleryImages[dragIndex];
      const updatedImages = [...galleryImages];
      updatedImages.splice(dragIndex, 1);
      updatedImages.splice(hoverIndex, 0, dragImage);

      // Update the order property based on the new position
      const reorderedImages = updatedImages.map((image, index) => ({
        ...image,
        order: index + 1,
      }));

      setGalleryImages(reorderedImages);
    },
    [galleryImages, setGalleryImages]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="widget-content">
        <div className="grid grid-cols-2 gap-3">
          {galleryImages
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((image, index) => (
              <div
                key={index}
                className="aspect-square border border-dashed border-gray-300 flex items-center justify-center cursor-pointer rounded bg-gray-50 hover:bg-gray-100 transition"
              >
                <DraggableImage
                  index={index}
                  image={image}
                  moveImage={moveImage}
                  handleRemoveImage={handleRemoveImageInternal}
                  contentType={`${contentType}s`} // Adjust contentType as needed
                />
              </div>
            ))}
          <div
            className="aspect-square  border border-dashed border-gray-300 flex items-center justify-center cursor-pointer rounded bg-gray-50 hover:bg-gray-100 transition"
            onClick={handleClick}
          >
            <span className="text-gray-400 text-4xl font-bold select-none">
              +
            </span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
      </div>
    </DndProvider>
  );
};

export default ImageUpload;
