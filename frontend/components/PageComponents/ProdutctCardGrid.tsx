'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/UI/SafeImage';
import { Product } from '@/types/types';
import { formatCurrency } from '@/helpers/common';
import AddToCartButton from '@/components/UI/Buttons/AddToCartButton';
import QuickViewModal from '@/components/Modals/QuickView';
import QuickViewIcon from '@/components/UI/Icons/QuickView';
import AddToWishlistButton from '@/components/UI/Buttons/AddToWishlistButton';
import { getPublicImageUrl } from '@/helpers/media';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Skeleton component for loading state
export const ProductCardGridSkeleton: React.FC<{
  count?: number;
}> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`skeleton-${index}`}
          className="product-card product-card-grid col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
        >
          <div className="product-card border border-gray-200 relative overflow-hidden">
            {/* Skeleton Quick View Button */}
            <div className="product-card-quickview-btn opacity-30">
              <Skeleton circle width={32} height={32} />
            </div>

            {/* Skeleton Wishlist Button */}
            <div className="product-card-actions-list top-8 opacity-30">
              <Skeleton circle width={32} height={32} />
            </div>

            {/* Skeleton Image */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/9] lg:aspect-[4/3] overflow-hidden rounded-lg shadow-sm">
              <Skeleton height="100%" />
            </div>

            {/* Skeleton Product Details */}
            <div className="product-inner p-4 space-y-3">
              {/* Skeleton Title */}
              <div className="space-y-2">
                <Skeleton count={2} />
              </div>

              {/* Skeleton Price and Button */}
              <div className="flex justify-between items-center">
                <Skeleton width={80} height={24} />
                <Skeleton width={96} height={32} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// Full page skeleton component for product grid pages
export const ProductGridPageSkeleton: React.FC<{
  showFilters?: boolean;
  productsPerRow?: 3 | 4;
  rows?: number;
}> = ({ showFilters = true, productsPerRow = 4, rows = 3 }) => {
  const totalProducts = productsPerRow * rows;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header Skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton width={256} height={32} />
        <Skeleton width={384} height={16} />
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters Skeleton */}
        {showFilters && (
          <div className="w-64 space-y-6">
            {/* Filter sections */}
            {Array.from({ length: 4 }, (_, index) => (
              <div key={`filter-${index}`} className="space-y-3">
                <Skeleton width={128} height={20} />
                <div className="space-y-2">
                  <Skeleton count={3} width={96} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid Skeleton */}
        <div className="flex-1">
          {/* Sort/View Options Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <Skeleton width={160} height={24} />
            <div className="flex gap-2">
              <Skeleton width={96} height={32} />
              <Skeleton width={80} height={32} />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-12 gap-6">
            <ProductCardGridSkeleton count={totalProducts} />
          </div>

          {/* Pagination Skeleton */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <Skeleton circle width={32} height={32} count={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCardGrid: React.FC<{
  product: Product;
  imageHeight: string;
  index?: number;
}> = ({ product, index = 0 }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Prepare images
  const hasSecondImage = product.images && product.images.length > 1;

  return (
    <div
      key={product.id}
      className="product-card product-card-grid col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 h-full"
    >
      <div className="product-card border border-gray-200 h-full flex flex-col bg-white overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <button
          type="button"
          className="product-card-quickview-btn"
          aria-label="Quick view"
          onClick={() => setModalVisible(true)}
        >
          <QuickViewIcon />
        </button>
        <div className="product-card-actions-list top-8">
          <AddToWishlistButton product={product} />
        </div>
        <Link href={`/shop/${product.slug}`}>
          <div className="relative w-full aspect-[4/3] overflow-hidden group">
            {/* Second image: hidden by default, visible on hover */}
            {hasSecondImage && (
              <SafeImage
                alt={`${product.title} - View 2`}
                className="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
                images={[
                  {
                    image_path: getPublicImageUrl(
                      'products',
                      product.id,
                      product.images[1].image_path + '_medium.webp'
                    ),
                  },
                ]}
                fill={true}
              />
            )}

            {/* First image */}
            <SafeImage
              alt={product.title}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                hasSecondImage
                  ? 'opacity-100 group-hover:opacity-0'
                  : 'opacity-100'
              }`}
              images={[
                {
                  image_path: getPublicImageUrl(
                    'products',
                    product.id,
                    product.images[0]
                      ? product.images[0].image_path + '_medium.webp'
                      : ''
                  ),
                },
              ]}
              fill={true}
              priority={index < 4}
            />
          </div>
        </Link>

        <div className="product-inner p-4 flex flex-col flex-grow">
          <div className="product-item-meta flex-grow">
            {/* Product Tags */}
            <div className="product-tags mb-2 flex flex-wrap gap-1">
              {product.categories && product.categories.length > 0 ? (
                product.categories.slice(0, 2).map((category, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?category=${category.slug}`}
                    className="text-[10px] uppercase tracking-wider text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {category.name}
                    {idx < Math.min(product.categories.length, 2) - 1 && ','}
                  </Link>
                ))
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Uncategorized
                </span>
              )}
            </div>

            {/* Product Title */}
            <Link href={`/shop/${product.slug}`}>
              <h2 className="product-item-meta__title text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                {product.title}
              </h2>
            </Link>

            {/* Rating and Inventory */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < (product.rating || 5)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-[10px] text-gray-500 ml-1">
                  ({product.reviews_count || 1})
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-[10px] font-medium ${
                    product.stock_quantity > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="product-price mb-4">
              <div className="product-item-meta__price-list-container">
                <div className="price-list price-sale flex items-baseline gap-2">
                  <span className="price text-xl font-bold text-blue-700">
                    <span className="sr-only">Sale price</span>
                    {formatCurrency(product.price)}
                  </span>
                  {product.compare_price && (
                    <span className="price price--compare text-sm text-gray-400 line-through">
                      <span className="sr-only">Regular price</span>
                      {formatCurrency(product.compare_price)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="product-caption-bottom space-y-1.5 mb-5">
              {[
                '5 Years Guarantee',
                'Free 90 days return',
                'Installment options',
              ].map((policy, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M6.66647 10.1139L12.7947 3.98568L13.7375 4.92849L6.66647 11.9995L2.42383 7.75693L3.36664 6.81413L6.66647 10.1139Z"
                        fill="#33CB79"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 leading-none">
                    {policy}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-auto pt-2">
            <AddToCartButton product={product} variant="full" />
          </div>
        </div>
      </div>
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

export default ProductCardGrid;
