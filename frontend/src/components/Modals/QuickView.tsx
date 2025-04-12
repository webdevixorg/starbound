import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ShareSection from '../PageComponents/Share/ShareSection';
import { Compare } from '@mui/icons-material';
import { Rating } from '@mui/material';
import { formatCurrency } from '../../helpers/common';
import ProductGallery from '../PageComponents/ProductGallery';
import AddToCartButton from '../UI/Buttons/AddToCart';
import HeartIcon from '../UI/Icons/Heart';
import PaymentMethods from '../UI/Icons/PaymentMethods';
import TickSheildIcon from '../UI/Icons/TickSheild';

import { Product } from '../../types/types';
import CloseIcon from '../UI/Icons/Apple';

interface QuickViewModalProps {
  product: Product;
  isAuthenticated: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isAuthenticated,
  onClose,
}) => {
  const [quantity, setQuantity] = useState<number>(1);

  const handleIncrement = () => setQuantity(quantity + 1);
  const handleDecrement = () => quantity > 1 && setQuantity(quantity - 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white  relative w-12/12 sm:w-3/4 md:w-2/3 lg:w-2/3 xl:w-1/2 rounded">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-0 right-0 z-2 p-4 border-none rounded-tr-md rounded-br-md bg-transparent fill-current transition duration-200 bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <CloseIcon />
        </button>
        <div className="pt-10 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Gallery */}
            <div>
              <ProductGallery product={product} />
            </div>

            <div className="px-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl text-blue-600">{product.title}</h2>
                {isAuthenticated && (
                  <a
                    href={`/products/${product.slug}/edit`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </a>
                )}
              </div>
              <div className="mb-4">
                <Rating value={0}></Rating>
              </div>
              <div className="mb-4">
                <p className="text-secondary mb-2 pb-2 font-bold border-b">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-8">
                {product.short_description}
              </p>
              <div className="cart flex items-center mb-1">
                <div className="quantity flex items-center border border-gray-300 mr-4">
                  <button
                    type="button"
                    className="minus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2"
                    onClick={handleDecrement}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    id="quantity"
                    className="input-text qty bg-gray-200 text-center py-1 px-1 w-10"
                    name="quantity"
                    value={quantity}
                    aria-label="Product quantity"
                    min="1"
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />

                  <button
                    type="button"
                    className="plus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2"
                    onClick={handleIncrement}
                  >
                    +
                  </button>
                </div>
                <AddToCartButton product={product} />
              </div>
              <div className="flex justify-end">
                <a
                  onClick={() => (window.location.href = '/cart')}
                  className="mt-4 text-blue-500 underline hover:text-blue-700 cursor-pointer"
                >
                  View Cart
                </a>
              </div>
              <div className="flex space-x-4 py-2 mb-4 border-b">
                <button className="flex items-center space-x-2 font-bold rounded border-r pr-4">
                  <span className="starbound-btn-icon starbound-icon-1">
                    <Compare />
                  </span>
                  <span className="starbound-btn-text">Compare</span>
                </button>

                <button className="flex items-center space-x-2 font-bold rounded">
                  <span className="starbound-btn-icon starbound-icon-1">
                    <HeartIcon />
                  </span>
                  <span className="starbound-btn-text">Add to wishlist</span>
                </button>
              </div>

              <ul className="mb-4 list-none p-0">
                <li className="flex items-center mb-2">
                  <TickSheildIcon />
                  <p className="text-sm text-gray-600 ml-2">
                    Estimated Delivery: Up to 4 business days
                  </p>
                </li>
                <li className="flex items-center mb-2">
                  <TickSheildIcon />
                  <p className="text-sm text-gray-600 ml-2">
                    Shipping & Returns: On all orders over Rs. 20,000
                  </p>
                </li>
              </ul>

              <PaymentMethods />
              <div className="product_meta mt-4 text-gray-600 text-sm">
                <span className="sku_wrapper block">
                  SKU: <span className="sku">{product.sku}</span>
                </span>

                <span className="posted_in block">
                  Categories:
                  {product.categories.map((category, index) => (
                    <React.Fragment key={category.slug}>
                      <Link
                        to={`/products/categories/${category.slug}`}
                        className="text-gray-500 underline hover:text-primary-500 ml-1"
                      >
                        {category.name}
                      </Link>
                      {index < product.categories.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </span>
              </div>

              <ShareSection product={product} />
            </div>
          </div>
        </div>
        <a
          className="quickview__see-details block text-center text-gray-600 text-base h-13 leading-[50px] border-t border-gray-200 rounded-b-md transition duration-150"
          href="/themes/blue/products/brandix-brake-kit-bdx-750z370-s"
        >
          See full details
        </a>
      </div>
    </div>
  );
};

export default QuickViewModal;
