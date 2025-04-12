import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/types';
import { formatCurrency } from '../../helpers/common';
import AddToCartIcon from '../UI/Buttons/AddToCartIcon';
import QuickViewModal from '../Modals/QuickView';
import QuickViewIcon from '../UI/Icons/QuickView';

const ProductCardGrid: React.FC<{ product: Product; imageHeight: string }> = ({
  product,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <div
      key={product.id}
      className="product-grid col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
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
          <button
            className="flex h-8 w-8 items-center justify-center rounded-sm"
            title="View Details"
            onClick={() => {
              window.location.href =
                '/products/a-light-inverted-pendant-quis-justo-condimentum';
            }}
          >
            <i className="bi bi-heart text-white text"></i>
          </button>

          {/* Quick View Button */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-sm"
            data-target=".modal-quick"
            type="button"
            title="Add to Wish List"
          >
            <i className="bi bi-eye text-white"></i>
          </button>
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
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out opacity-100 hover:opacity-0"
            />
            <img
              src={
                product.images && product.images.length > 1
                  ? product.images[1].image_path
                  : 'https://logivis.com/300x200.png'
              }
              alt={product.title}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out opacity-0 hover:opacity-100"
            />
          </div>
        </Link>

        <div className="product-inner p-4">
          <div className="product-card-meta  text-gray-400 text-xs">
            <span className="product-card-sku">SKU: </span>
            573-23743-C
          </div>
          <Link to={`/products/${product.slug}`}>
            <h2 className="font-sm capitalize text-gray-900 dark:text-white mb-3">
              {product.title}
            </h2>
          </Link>
          <div className="mt-auto flex justify-between items-center">
            <span className="font-semibold text-gay-500">
              {formatCurrency(product.price)}
            </span>
            {/* Add to Cart - Takes Full Remaining Width */}
            <AddToCartIcon product={product} />
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
