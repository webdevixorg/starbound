import React, { useEffect, useState } from 'react';
import { fetchProductsForSections } from '../../services/api'; // Ensure this path is correct
import { Product } from '../../types/types';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../helpers/common';

const ProductListSidebar: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProductsForSections(filter, count);
        setProducts(data.results);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    loadProducts();
  }, [filter, count]);

  return (
    <div className="container mb-10">
      <div className="border-b flex justify-between items-end mb-6 pb-4">
        <h2 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">
          <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
          Popular Products
        </h2>
      </div>

      <div className="space-y-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="group cursor-pointer flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6 mb-6"
          >
            {/* Product Image */}
            <div className="flex-shrink-0 w-24 h-20 sm:w-16 sm:h-12 lg:w-24 lg:h-20">
              <Link
                to={`/products/${product.slug}`}
                className="block relative overflow-hidden w-full h-full"
              >
                <img
                  alt={product.title}
                  className="object-cover w-full h-full transition-transform duration-500 ease-in-out transform hover:scale-110"
                  sizes="(max-width: 768px) 30vw, 33vw"
                  src={
                    product.images && product.images[0]?.image_path
                      ? product.images[0].image_path
                      : '/assets/image_placeholder.jpg'
                  }
                />
              </Link>
            </div>

            {/* Product Content */}
            <div className="flex-1">
              {/* Product Title */}
              <h2 className="text-xs sm:text-sm md:text-base lg:text xl:text-lg mb-1 dark:text-white">
                <Link
                  to={`/products/${product.slug}`}
                  className="transition-all duration-500 text-gray-600 hover:text-blue-600"
                >
                  {product.title}
                </Link>
              </h2>

              {/* Vendor (Author) and Price */}
              <div className="flex items-center space-x-3 text-gray-900 dark:text-gray-400">
                <span className="text font-semibold dark:text-gray-600">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListSidebar;
