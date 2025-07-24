import React, { useState } from 'react';

interface ProductImage {
  order: number;
  image_path: string;
}

interface Product {
  title: string;
  images: ProductImage[];
}

interface ProductGalleryProps {
  product: Product;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    product.images.find((image) => image.order === 1) || null
  );

  const handleThumbnailClick = (image: ProductImage) => {
    setSelectedImage(image);
  };

  return (
    <div className="product-gallery">
      {/* Large Main Image */}
      {selectedImage && (
        <div className="main-image">
          <img
            className="w-full h-auto object-cover"
            src={selectedImage.image_path}
            alt={product.title}
          />
        </div>
      )}

      {/* Thumbnail Tiles */}
      <div className="thumbnail-gallery flex mt-4 space-x-2 overflow-x-auto">
        {product.images
          .sort((a, b) => a.order - b.order) // Sort by order
          .map((image) => (
            <div
              key={image.order}
              className={`thumbnail-item border rounded p-1 ${
                selectedImage?.order === image.order ? 'border-blue-500' : ''
              }`}
              onClick={() => handleThumbnailClick(image)}
            >
              <img
                className="w-20 h-20 object-cover cursor-pointer"
                src={image.image_path}
                alt={`${product.title} - Thumbnail ${image.order}`}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProductGallery;
