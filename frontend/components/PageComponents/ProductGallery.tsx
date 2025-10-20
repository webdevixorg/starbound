import React, { useState } from 'react';
import SafeImage from '@/components/UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';

interface ProductImage {
  id: number;
  order: number;
  image_path: string;
}

interface Product {
  id: number;
  title: string;
  images: ProductImage[];
}

interface ProductGalleryProps {
  product: Product;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    product.images.find((image) => image.order === 1) ||
      product.images[0] ||
      null
  );
  const [fadeIn, setFadeIn] = useState(true);

  const handleThumbnailClick = (image: ProductImage) => {
    setFadeIn(false);
    setTimeout(() => {
      setSelectedImage(image);
      setFadeIn(true);
    }, 100); // Short delay for fade-out before fade-in
  };

  return (
    <div className="product-gallery">
      {/* Large Main Image */}
      {selectedImage && (
        <div className="main-image relative w-full h-[485px] block">
          <div
            className={`w-full h-full transition-opacity duration-500 ${
              fadeIn ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <SafeImage
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
              images={[
                {
                  image_path: getPublicImageUrl(
                    'products',
                    product.id,
                    selectedImage.image_path
                  ),
                },
              ]}
              width={800}
              height={485}
            />
          </div>
        </div>
      )}

      {/* Thumbnail Tiles */}
      <div className="thumbnail-gallery flex mt-4 space-x-2 overflow-x-auto">
        {product.images
          .sort((a, b) => a.order - b.order)
          .map((image, index) => (
            <div
              key={`image-${image.order}-${index}`}
              className={`thumbnail-item border rounded p-1 ${
                selectedImage && selectedImage.id === image.id
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}
              onClick={() => handleThumbnailClick(image)}
            >
              <div className="relative w-20 h-20">
                <SafeImage
                  className="w-full h-full object-cover cursor-pointer"
                  images={[
                    {
                      image_path: getPublicImageUrl(
                        'products',
                        product.id,
                        image.image_path
                      ),
                    },
                  ]}
                  alt={`${product.title} - Thumbnail ${image.order}`}
                  fill
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProductGallery;
