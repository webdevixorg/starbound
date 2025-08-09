import React from 'react';
import SafeImage from '@/components/UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';
import { Product } from '@/types/types';

interface FeaturedProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'mini';
  showPrice?: boolean;
  showCategory?: boolean;
  className?: string;
}

const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({
  product,
  variant = 'default',
  showPrice = true,
  showCategory = true,
  className = '',
}) => {
  const cardClasses = {
    default:
      'group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden',
    compact:
      'group relative bg-white rounded-md shadow-sm hover:shadow transition-shadow duration-300 overflow-hidden',
    mini: 'group relative bg-white rounded shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden',
  };

  const imageHeights = {
    default: 'h-48',
    compact: 'h-32',
    mini: 'h-24',
  };

  const textSizes = {
    default: { title: 'text-sm', price: 'text-lg', category: 'text-xs' },
    compact: { title: 'text-xs', price: 'text-sm', category: 'text-xs' },
    mini: { title: 'text-xs', price: 'text-sm', category: 'text-xs' },
  };

  return (
    <div className={`${cardClasses[variant]} ${className}`}>
      {/* Product Image */}
      <div className={`relative ${imageHeights[variant]} bg-gray-100`}>
        <a
          href={`/shop/${product.slug}`}
          className="block relative overflow-hidden w-full h-full group"
        >
          <SafeImage
            alt={product.title || 'Product Image'}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            images={[
              {
                image_path: getPublicImageUrl(
                  'products',
                  product.id,
                  product.images?.[0]?.image_path
                ),
              },
            ]}
            fill
          />
        </a>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Category */}
        {showCategory &&
          product.categories &&
          product.categories.length > 0 && (
            <div className="mb-1">
              <span
                className={`${textSizes[variant].category} text-gray-500 font-medium`}
              >
                {typeof product.categories[0] === 'object'
                  ? product.categories[0].name
                  : product.categories[0]}
              </span>
            </div>
          )}

        {/* Product Title */}
        <h3
          className={`${textSizes[variant].title} font-semibold text-gray-900 line-clamp-2 mb-1`}
        >
          <a
            href={`/shop/${product.slug}`}
            className="hover:text-gray-700 transition-colors"
          >
            {product.title}
          </a>
        </h3>

        {/* Price */}
        {showPrice && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {product.sale_price && product.sale_price < product.price ? (
                <>
                  <span
                    className={`${textSizes[variant].price} font-bold text-red-600`}
                  >
                    ${product.sale_price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span
                  className={`${textSizes[variant].price} font-bold text-gray-900`}
                >
                  ${product.price}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {product.stock_quantity !== undefined && (
              <span
                className={`${textSizes[variant].category} ${
                  product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedProductCard;
