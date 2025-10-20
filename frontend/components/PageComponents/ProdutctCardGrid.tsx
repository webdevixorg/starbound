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

const ProductCardGrid: React.FC<{ product: Product; imageHeight: string }> = ({
  product,
}) => {
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
        <div className="product-card-actions-list">
          <AddToWishlistButton product={product} />
        </div>
        <Link href={`/shop/${product.slug}`}>
          <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/9] lg:aspect-[4/3] overflow-hidden group rounded-lg shadow-sm">
            {/* First image: fades out on hover */}
            <SafeImage
              alt={product.title}
              className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 ease-in-out z-20 ${
                hasSecondImage
                  ? 'opacity-100 group-hover:opacity-0'
                  : 'opacity-100'
              }`}
              images={[
                {
                  image_path: getPublicImageUrl(
                    'products',
                    product.id,
                    product.images[0] ? product.images[0].image_path : ''
                  ),
                },
              ]}
              width={300}
              height={300}
            />

            {/* Second image: always visible, zooms in on hover */}
            {hasSecondImage && (
              <SafeImage
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-500 ease-in-out z-10 opacity-100 scale-100 group-hover:scale-110"
                images={[
                  {
                    image_path: getPublicImageUrl(
                      'posts',
                      product.id,
                      product.images[1].image_path
                    ),
                  },
                ]}
                width={300}
                height={300}
              />
            )}
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
