import React, { useEffect, useState } from 'react';
import { Product } from '@/types/types';
import Link from 'next/link';
import { formatCurrency } from '@/helpers/common';
import SafeImage from '../UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';
import { fetchProductsForSections } from '@/services/apiProducts';

interface ProductListSidebarProps {
  filter: string;
  count: number;
  title?: string;
  className?: string;
}

const ProductListSidebar: React.FC<ProductListSidebarProps> = ({
  filter,
  count,
  title = 'Featured Products',
  className = '',
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProductsForSections(filter, count);
        setProducts(data.results);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filter, count]);

  const getFilterIcon = () => {
    switch (filter) {
      case 'latest':
        return (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      case 'popular':
        return (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2L13.09 8.26L20 9L15 13.74L16.18 20.02L10 16.77L3.82 20.02L5 13.74L0 9L6.91 8.26L10 2Z"
            />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden ${className}`}
      >
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/50 to-green-100/30 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
            {title}
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex gap-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/50 to-green-100/30 border-b border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            {getFilterIcon()}
          </div>
          {title}
        </h3>
      </div>

      {/* Products List */}
      <div className="divide-y divide-gray-100/70">
        {products.map((product, index) => (
          <article
            key={product.id}
            className="group hover:bg-gray-50/60 transition-all duration-300 ease-out"
          >
            <Link
              href={`/shop/${product.slug}`}
              className="flex items-center gap-4 p-4"
            >
              {/* Product Image */}
              <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                <SafeImage
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  images={[
                    {
                      image_path: getPublicImageUrl(
                        'products',
                        product.id,
                        product.images?.[0]?.image_path
                      ),
                    },
                  ]}
                  fallback="/images/placeholders/612x612.png"
                  fill
                />

                {/* Ranking Badge for Popular Products */}
                {filter === 'popular' && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>
                )}

                {/* Sale Badge */}
                {product.sale_price && product.sale_price < product.price && (
                  <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-red-400 to-red-500 text-white text-xs font-bold rounded-md shadow-sm">
                    SALE
                  </div>
                )}
              </div>

              {/* Product Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Categories/Tags */}
                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.categories
                      .slice(0, 2)
                      .map((category, categoryIndex) => (
                        <span
                          key={`${product.id}-category-${category.id}-${categoryIndex}`}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        >
                          {category.name}
                        </span>
                      ))}
                  </div>
                )}

                {/* Product Title */}
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-200 leading-snug">
                  {product.title}
                </h4>

                {/* Price and Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Sale Price */}
                    {product.sale_price &&
                    product.sale_price < product.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-600">
                          {formatCurrency(product.sale_price)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-1">
                    {product.stock_quantity && product.stock_quantity > 0 ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">
                          In Stock
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-xs text-red-600 font-medium">
                          Out of Stock
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Rating (if available) */}
                {product.rating && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <svg
                          key={starIndex}
                          className={`w-3 h-3 ${
                            starIndex < Math.floor(product.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span>({product.rating})</span>
                  </div>
                )}
              </div>

              {/* Arrow indicator */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* View All Link */}
      {products.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-50/30 to-green-100/20 border-t border-gray-100/50">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200 group/link"
          >
            <span>Browse all products</span>
            <svg
              className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductListSidebar;
