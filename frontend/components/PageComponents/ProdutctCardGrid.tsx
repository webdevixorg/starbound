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
      className="product-card product-card-grid col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
    >
      <div className="product-card border border-gray-200">
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
          <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/9] lg:aspect-[4/3] overflow-hidden group rounded-lg shadow-sm">
            {/* Second image: hidden by default, visible on hover (render first so it's behind) */}
            {hasSecondImage && (
              <SafeImage
                alt={`${product.title} - View 2`}
                className="absolute inset-0 rounded-lg transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
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

            {/* First image: visible by default, fades out on hover (render last so it's on top) */}
            <SafeImage
              alt={product.title}
              className={`absolute inset-0 rounded-lg transition-opacity duration-500 ease-in-out ${
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
              priority={index < 4} // Add priority for first 4 products (above the fold)
            />
          </div>
        </Link>

        <div className="product-inner p-4">
          <Link href={`/shop/${product.slug}`}>
            <h2 className="font-sm capitalize text-gray-900 dark:text-white mb-3">
              {product.title}
            </h2>
          </Link>
          <div className="mt-auto flex justify-between items-center">
            <span className="text-xl text-gay-500">
              {formatCurrency(product.price)}
            </span>
            <AddToCartButton product={product} />
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
