import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/types';
import { formatCurrency } from '../../helpers/common';
import AddToCartButton from '../UI/Buttons/AddToCart';
import QuickViewIcon from '../UI/Icons/QuickView';
import QuickViewModal from '../Modals/QuickView';

const ProductCardList: React.FC<{ product: Product }> = ({ product }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <div className="product-list">
      <div
        key={product.id}
        className="product-card relative flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden mb-6"
      >
        <button
          type="button"
          className="product-card-quickview-btn"
          aria-label="Quick view"
          onClick={() => setModalVisible(true)} // Call a function here to set the modal visibility
        >
          <QuickViewIcon />
        </button>
        <Link
          to={`/products/${product.slug}`}
          className="flex-shrink-0 w-full md:w-1/3"
        >
          <div className="relative w-full overflow-hidden">
            {product.images.find((image) => image.order === 1) && (
              <img
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out transform hover:scale-110"
                src={String(
                  product.images.find((image) => image.order === 1)?.image_path
                )}
                alt={product.title}
              />
            )}
            {product.images.find((image) => image.order === 2) && (
              <img
                className="w-full h-full object-cover absolute top-0 left-0 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out transform hover:scale-110"
                src={String(
                  product.images.find((image) => image.order === 2)?.image_path
                )}
                alt={product.title}
              />
            )}
          </div>
        </Link>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-2">
              {product.categories.map((category) => category.name).join(', ')}
            </p>
            <Link to={`/products/${product.slug}`}>
              <h2 className="text-xl mb-2 text-gray-800 hover:text-gray-600 transition-colors duration-300">
                {product.title}
              </h2>
            </Link>
            <p className="text-sm text-gray-500 mb-2">
              {product.location_name}, {product.sublocation_name}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              {product.short_description}
            </p>
            <p className="text-secondary mb-4 font-bold text-lg">
              {formatCurrency(product.price)}
            </p>
            <AddToCartButton product={product} />
          </div>
        </div>
        {modalVisible && (
          <QuickViewModal
            product={product}
            isAuthenticated={true} // Example, set your authentication condition here
            onClose={() => setModalVisible(false)} // Close the modal
          />
        )}
      </div>
    </div>
  );
};

export default ProductCardList;
