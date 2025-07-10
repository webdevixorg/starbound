import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/types';
import { formatCurrency } from '../../helpers/common';
import AddToCartButton from '../UI/Buttons/AddToCartButton';
import QuickViewIcon from '../UI/Icons/QuickView';
import QuickViewModal from '../Modals/QuickView';

const ProductCardList: React.FC<{ product: Product }> = ({ product }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const primaryImage =
    product.images.find((img) => img.order === 1)?.image_path ||
    'https://logivis.com/300x200.png';

  const secondaryImage =
    product.images.find((img) => img.order === 2)?.image_path || null;

  return (
    <div className="product-card product-card-list">
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
        to={`/products/${product.slug}`}
        className="w-full md:w-1/3 relative group overflow-hidden"
      >
        <div className="relative aspect-[4/3] md:aspect-auto">
          <img
            src={primaryImage}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}
        </div>
      </Link>

      {/* Product Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          {/* Category Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories.length > 0 ? (
              product.categories.map((category) => (
                <span
                  key={category.id}
                  className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {category.slug}
                </span>
              ))
            ) : (
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded">
                Uncategorized
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug}`}>
            <h2 className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2">
              {product.title || 'Untitled Product'}
            </h2>
          </Link>

          {/* Location */}
          <p className="text-sm text-gray-500 mt-1">
            {product.location_name || 'Unknown Location'},{' '}
            {product.sublocation_name || 'Unknown Sublocation'}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {product.short_description ||
              'No description available for this product.'}
          </p>

          {/* Price */}
          <p className="text-lg font-bold text-secondary mt-4">
            {product.price
              ? formatCurrency(product.price)
              : 'Contact for Price'}
          </p>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-4 flex justify-end">
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
