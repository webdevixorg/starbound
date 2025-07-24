import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/types';
import { formatCurrency } from '@/helpers/common';
import AddToCartButton from '@/components/UI/Buttons/AddToCartButton';
import QuickViewIcon from '@/components/UI/Icons/QuickView';
import QuickViewModal from '@/components/Modals/QuickView';

const ProductCardList: React.FC<{ product: Product }> = ({ product }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [secondaryImageError, setSecondaryImageError] =
    useState<boolean>(false);

  // Primary image with fallback logic
  const primaryImage = product.images?.find(
    (img) => img.order === 1
  )?.image_path;
  const fallbackImage = '/images/placeholder-product.png';

  // Secondary image for hover effect
  const secondaryImage = product.images?.find(
    (img) => img.order === 2
  )?.image_path;

  // Determine which image to show for primary
  const displayPrimaryImage =
    imageError || !primaryImage ? fallbackImage : primaryImage;

  // Determine which image to show for secondary (only if primary is not fallback)
  const displaySecondaryImage =
    secondaryImageError || !secondaryImage || imageError || !primaryImage
      ? null
      : secondaryImage;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSecondaryImageError = () => {
    setSecondaryImageError(true);
  };

  return (
    <div className="product-card product-card-list relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row overflow-hidden">
      {/* Quick View Button */}
      <button
        type="button"
        className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow hover:shadow-md hover:bg-gray-50 transition"
        aria-label="Quick view"
        onClick={() => setModalVisible(true)}
      >
        <QuickViewIcon />
      </button>

      {/* Product Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="w-full md:w-1/3 relative group overflow-hidden"
      >
        <div className="relative aspect-[4/3] md:aspect-square bg-gray-100">
          <img
            src={displayPrimaryImage}
            alt={product.title || 'Product Image'}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
          {displaySecondaryImage && (
            <img
              src={displaySecondaryImage}
              alt={`${product.title} - Alternative view`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              onError={handleSecondaryImageError}
              loading="lazy"
            />
          )}

          {/* Image placeholder overlay when using fallback */}
          {(imageError || !primaryImage) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs">No Image</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          {/* Category Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories && product.categories.length > 0 ? (
              product.categories.map((category) => (
                <span
                  key={category.id}
                  className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                >
                  {category.name || category.slug}
                </span>
              ))
            ) : (
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">
                Uncategorized
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/shop/${product.slug}`}>
            <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 mb-1">
              {product.title || 'Untitled Product'}
            </h2>
          </Link>

          {/* Location */}
          {(product.location_name || product.sublocation_name) && (
            <div className="flex items-center text-sm text-gray-500 mt-1 mb-2">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {product.location_name || 'Unknown Location'}
                {product.sublocation_name && `, ${product.sublocation_name}`}
              </span>
            </div>
          )}

          {/* Description */}
          {product.short_description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Product Features/Specs */}
          {product.features && product.features.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {product.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                  >
                    {feature}
                  </span>
                ))}
                {product.features.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{product.features.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                {product.original_price &&
                  product.original_price > product.price && (
                    <span className="text-sm text-gray-400 line-through mr-2">
                      {formatCurrency(product.original_price)}
                    </span>
                  )}
                <span className="text-xl font-bold text-green-600">
                  {product.price
                    ? formatCurrency(product.price)
                    : 'Contact for Price'}
                </span>
              </div>

              {/* Discount Badge */}
              {product.original_price &&
                product.original_price > product.price && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {Math.round(
                      ((product.original_price - product.price) /
                        product.original_price) *
                        100
                    )}
                    % OFF
                  </span>
                )}
            </div>
          </div>

          {/* Stock Status */}
          {product.stock_quantity !== undefined && (
            <div className="mt-2">
              {product.stock_quantity > 0 ? (
                <span className="text-xs text-green-600 font-medium">
                  ✓ In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-xs text-red-600 font-medium">
                  ✗ Out of Stock
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href={`/shop/${product.slug}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            View Details →
          </Link>
          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Modal */}
      {modalVisible && (
        <QuickViewModal
          product={product}
          isAuthenticated={true}
          onClose={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

export default ProductCardList;
