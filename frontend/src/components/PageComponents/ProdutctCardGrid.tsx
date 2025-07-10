import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/types';
import { formatCurrency } from '../../helpers/common';
import AddToCartButton from '../UI/Buttons/AddToCartButton';
import QuickViewModal from '../Modals/QuickView';
import QuickViewIcon from '../UI/Icons/QuickView';
import AddToWishlistButton from '../UI/Buttons/AddToWishlistButton';

const ProductCardGrid: React.FC<{ product: Product; imageHeight: string }> = ({
  product,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <div
      key={product.id}
      className="product-card product-card-grid col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
    >
      <div className="product-card border border-gray-200">
        <button
          type="button"
          className="product-card-quickview-btn"
          aria-label="Quick view"
          onClick={() => setModalVisible(true)} // Call a function here to set the modal visibility
        >
          <QuickViewIcon />
        </button>
        <div className="product-card-actions-list">
          {/* Wishlist Button */}
          <AddToWishlistButton product={product} />
        </div>
        <Link to={`/products/${product.slug}`}>
          <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/9] lg:aspect-[4/3] overflow-hidden">
            <img
              src={
                product.images && product.images.length > 0
                  ? product.images[0].image_path
                  : 'https://logivis.com/300x200.png'
              }
              alt={product.title}
              className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out opacity-100 hover:opacity-0"
            />
            <img
              src={
                product.images && product.images.length > 1
                  ? product.images[1].image_path
                  : 'https://logivis.com/300x200.png'
              }
              alt={product.title}
              className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out opacity-0 hover:opacity-100"
            />
          </div>
        </Link>

        <div className="product-inner p-4">
          <Link to={`/products/${product.slug}`}>
            <h2 className="font-sm capitalize text-gray-900 dark:text-white mb-3">
              {product.title}
            </h2>
          </Link>
          <div className="mt-auto flex justify-between items-center">
            <span className="text-xl text-gay-500">
              {formatCurrency(product.price)}
            </span>
            {/* Add to Cart - Takes Full Remaining Width */}
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
      {/* Modal */}
      {modalVisible && (
        <QuickViewModal
          product={product}
          isAuthenticated={true} // Example, set your authentication condition here
          onClose={() => setModalVisible(false)} // Close the modal
        />
      )}
    </div>
  );
};

export default ProductCardGrid;
