'use client';

import React, { useEffect, useState } from 'react';
import { fetchProductsForSections } from '@/services/apiProducts'; // Ensure this path is correct
import { Product } from '@/types/types';
import ProductCardGrid from './ProdutctCardGrid';

const ProductGridSection: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setError(null);
        const data = await fetchProductsForSections(filter, count);
        setProducts(data.results || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [filter, count]);

  return (
    <section className="py-12 bg-white-50 mb-10">
      <h2 className="text-3xl text-left text-gray-800 mb-8">
        <span className="font-bold">Popular</span> Products
      </h2>

      {/* Loading State */}
      {loadingProducts && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading products...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loadingProducts && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.118 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Unable to Load Products
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loadingProducts && !error && products.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6 0V1"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-500 mb-4">
            There are currently no popular products available.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loadingProducts && !error && products.length > 0 && (
        <div className="col-span-12 md:col-span-8 lg:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-12 gap-5">
            {products.map((product) => (
              <ProductCardGrid
                key={product.id}
                product={product}
                imageHeight={''}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductGridSection;
