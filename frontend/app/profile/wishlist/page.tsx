'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/Common/Loading';
import SafeImage from '@/components/UI/SafeImage';
import HtmlContent from '@/helpers/content';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import ModalAlert from '@/components/Modals/ModalAlert';
import { getPublicImageUrl } from '@/helpers/media';

// Types
interface WishlistProduct {
  id: string | number;
  title: string;
  description?: string;
  location_name?: string;
  price: number | string;
  images?: Array<{
    image_path: string;
    alt?: string;
  }>;
  slug?: string;
  category?: string;
  rating?: number;
  reviews_count?: number;
}

interface WishlistItem {
  id: string | number;
  product: WishlistProduct;
  added_at?: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist, isLoading } =
    useWishlist();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/profile/wishlist');
    }
  }, [authLoading, user, router]);

  // Handle remove item
  const handleRemoveClick = useCallback((item: WishlistItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const confirmRemove = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      await removeFromWishlist(String(itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      setError('Failed to remove item from wishlist');
      console.error('Error removing from wishlist:', error);
    }
  }, [itemToDelete, removeFromWishlist]);

  const cancelRemove = useCallback(() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }, []);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    if (wishlist.length === 0) return;
    setShowClearModal(true);
  }, [wishlist.length]);

  const confirmClearAll = useCallback(async () => {
    try {
      await clearWishlist();
      setShowClearModal(false);
    } catch (error) {
      setError('Failed to clear wishlist');
      console.error('Error clearing wishlist:', error);
    }
  }, [clearWishlist]);

  const cancelClearAll = useCallback(() => {
    setShowClearModal(false);
  }, []);

  // Format price
  const formatPrice = useCallback((price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 'Price unavailable' : `$${numPrice.toFixed(2)}`;
  }, []);

  // Get product URL
  const getProductUrl = useCallback((product: WishlistProduct): string => {
    if (product.slug) {
      return `/shop/${product.slug}`;
    }
    return `/shop/${product.id}`;
  }, []);

  // Loading states
  if (authLoading || loading || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {' '}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth check
  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <BreadcrumbsComponent />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="mt-1 text-sm text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}{' '}
                saved for later
              </p>
            </div>

            {wishlist.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {wishlist.length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start exploring our products and save your favorites here for
                easy access later.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Browse Products
              </Link>
            </div>
          ) : (
            // Wishlist Table
            <div className="overflow-hidden">
              {/* Desktop View */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {wishlist.map((item: WishlistItem) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-20 w-20">
                              {item.product.images?.[0]?.image_path ? (
                                <SafeImage
                                  alt={
                                    item.product.images[0].alt ||
                                    item.product.title
                                  }
                                  className="h-20 w-20 object-cover rounded-lg"
                                  images={[
                                    {
                                      image_path: getPublicImageUrl(
                                        'products',
                                        typeof item.product.id === 'string'
                                          ? parseInt(item.product.id, 10)
                                          : item.product.id,
                                        item.product.images[0].image_path
                                      ),
                                    },
                                  ]}
                                  width={80}
                                  height={80}
                                />
                              ) : (
                                <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Link
                                href={getProductUrl(item.product)}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {item.product.title}
                              </Link>
                              {item.product.category && (
                                <p className="text-sm text-gray-500">
                                  {item.product.category}
                                </p>
                              )}
                              {item.product.rating && (
                                <div className="flex items-center mt-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < item.product.rating!
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
                                  {item.product.reviews_count && (
                                    <span className="ml-1 text-sm text-gray-500">
                                      ({item.product.reviews_count})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {item.product.description ||
                              'No description available'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.product.location_name ||
                            'Location not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(item.product.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={getProductUrl(item.product)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleRemoveClick(item)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {wishlist.map((item: WishlistItem) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          {item.product.images?.[0]?.image_path ? (
                            <SafeImage
                              alt={
                                item.product.images[0].alt || item.product.title
                              }
                              className="h-20 w-20 object-cover rounded-lg"
                              images={[
                                {
                                  image_path: getPublicImageUrl(
                                    'products',
                                    typeof item.product.id === 'string'
                                      ? parseInt(item.product.id, 10)
                                      : item.product.id,
                                    item.product.images[0].image_path
                                  ),
                                },
                              ]}
                              width={80}
                              height={80}
                            />
                          ) : (
                            <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={getProductUrl(item.product)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors block"
                          >
                            {item.product.title}
                          </Link>
                          {item.product.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              <HtmlContent
                                htmlContent={item.product.description}
                              />
                            </p>
                          )}
                          {item.product.location_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              📍 {item.product.location_name}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-medium text-gray-900">
                              {formatPrice(item.product.price)}
                            </span>
                            <div className="flex space-x-2">
                              <Link
                                href={getProductUrl(item.product)}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleRemoveClick(item)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      <ModalAlert
        isOpen={showDeleteModal}
        title="Remove from Wishlist"
        message={`Are you sure you want to remove "${itemToDelete?.product.title}" from your wishlist?`}
        onClose={cancelRemove}
        onConfirm={confirmRemove}
        confirmText="Remove"
        cancelText="Cancel"
      />
      {/* Clear All Confirmation Modal */}
      <ModalAlert
        isOpen={showClearModal}
        title="Clear Wishlist"
        message="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
        onClose={cancelClearAll}
        onConfirm={confirmClearAll}
        confirmText="Clear All"
        cancelText="Cancel"
      />
      {/* Error Modal */}
      {error && (
        <ModalAlert
          isOpen={!!error}
          title="Error"
          message={error}
          onClose={() => setError(null)}
          onConfirm={() => setError(null)}
          confirmText="OK"
          cancelText=""
        />
      )}
    </div>
  );
}
