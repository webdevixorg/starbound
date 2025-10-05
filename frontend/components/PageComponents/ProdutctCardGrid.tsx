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
                className="absolute inset-0 object-cover rounded-lg transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
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
              className={`absolute inset-0 object-cover rounded-lg transition-opacity duration-500 ease-in-out ${
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
