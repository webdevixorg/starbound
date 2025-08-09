'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';
import { Review, TrashState } from '@/types/review';
import { reviewService } from '@/services/reviewService';

export default function TrashPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [state, setState] = useState<TrashState>({
    loading: true,
    reviews: [],
    restoring: null,
    deleting: null,
    error: null,
    success: null,
    showRestoreModal: false,
    showDeleteModal: false,
    showErrorModal: false,
    showSuccessModal: false,
    reviewToRestore: null,
    reviewToDelete: null,
    isClient: false,
  });

  // Ensure client-side rendering
  useEffect(() => {
    setState((prev) => ({ ...prev, isClient: true }));
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (state.isClient && !user) {
      router.push('/auth/login');
    }
  }, [user, router, state.isClient]);

  // Load trashed reviews
  const loadTrashedReviews = useCallback(async () => {
    if (!state.isClient || !user) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const trashedReviews = await reviewService.getTrashedReviews();
      setState((prev) => ({
        ...prev,
        reviews: trashedReviews,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error loading trashed reviews:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load trashed reviews. Please try again.',
        showErrorModal: true,
        loading: false,
        reviews: [],
      }));
    }
  }, [state.isClient, user]);

  // Initial load
  useEffect(() => {
    if (state.isClient && user) {
      loadTrashedReviews();
    }
  }, [loadTrashedReviews, state.isClient, user]);

  // Handle restore review
  const handleRestoreClick = useCallback((review: Review) => {
    setState((prev) => ({
      ...prev,
      reviewToRestore: review,
      showRestoreModal: true,
    }));
  }, []);

  const confirmRestore = useCallback(async () => {
    if (!state.reviewToRestore) return;

    setState((prev) => ({
      ...prev,
      restoring: String(state.reviewToRestore!.id),
      showRestoreModal: false,
    }));

    try {
      await reviewService.restoreUserReview(state.reviewToRestore.id);

      setState((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== state.reviewToRestore!.id),
        restoring: null,
        reviewToRestore: null,
        success: 'Review restored successfully.',
        showSuccessModal: true,
      }));
    } catch (error: any) {
      console.error('Error restoring review:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to restore review. Please try again.',
        showErrorModal: true,
        restoring: null,
      }));
    }
  }, [state.reviewToRestore]);

  // Handle permanent delete
  const handleDeleteClick = useCallback((review: Review) => {
    setState((prev) => ({
      ...prev,
      reviewToDelete: review,
      showDeleteModal: true,
    }));
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!state.reviewToDelete) return;

    setState((prev) => ({
      ...prev,
      deleting: String(state.reviewToDelete!.id),
      showDeleteModal: false,
    }));

    try {
      await reviewService.permanentlyDeleteReview(state.reviewToDelete.id);

      setState((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== state.reviewToDelete!.id),
        deleting: null,
        reviewToDelete: null,
        success: 'Review permanently deleted.',
        showSuccessModal: true,
      }));
    } catch (error: any) {
      console.error('Error deleting review:', error);
      let errorMessage =
        'Failed to permanently delete review. Please try again.';

      if (error.message.includes('not supported')) {
        errorMessage = error.message;
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        showErrorModal: true,
        deleting: null,
      }));
    }
  }, [state.reviewToDelete]);

  const cancelRestore = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showRestoreModal: false,
      reviewToRestore: null,
    }));
  }, []);

  const cancelDelete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showDeleteModal: false,
      reviewToDelete: null,
    }));
  }, []);

  // Utility function
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  if (!state.isClient) {
    return <LoadingSpinner />;
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
              <p className="mt-1 text-sm text-gray-600">
                {state.reviews.length} review
                {state.reviews.length !== 1 ? 's' : ''} in trash
              </p>
            </div>

            <button
              onClick={() => router.push('/profile/my-reviews')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Reviews
            </button>
          </div>
        </div>

        {/* Content */}
        {state.reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Trash is empty
            </h3>
            <p className="text-gray-600">No deleted reviews found.</p>
          </div>
        ) : (
          /* Trashed Reviews List */
          <div className="space-y-6">
            {state.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow border-l-4 border-red-400"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {review.product?.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Trashed
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>Rating: {review.rating}/5</span>
                        <span>•</span>
                        <span>
                          Deleted:{' '}
                          {formatDate(review.updated_at || review.created_at)}
                        </span>
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleRestoreClick(review)}
                        disabled={state.restoring === String(review.id)}
                        className="p-2 text-gray-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        title="Restore review"
                      >
                        {state.restoring === String(review.id) ? (
                          <InlineLoaderIcon className="w-4 h-4" />
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteClick(review)}
                        disabled={state.deleting === String(review.id)}
                        className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        title="Permanently delete"
                      >
                        {state.deleting === String(review.id) ? (
                          <InlineLoaderIcon className="w-4 h-4" />
                        ) : (
                          <svg
                            className="w-4 h-4"
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
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      <ModalAlert
        isOpen={state.showRestoreModal}
        title="Restore Review"
        message={`Are you sure you want to restore your review for "${state.reviewToRestore?.product?.title || 'this product'}"?`}
        onClose={cancelRestore}
        onConfirm={confirmRestore}
        confirmText="Restore"
        cancelText="Cancel"
      />

      {/* Delete Confirmation Modal */}
      <ModalAlert
        isOpen={state.showDeleteModal}
        title="Permanently Delete Review"
        message={`Are you sure you want to permanently delete your review for "${state.reviewToDelete?.product?.title || 'this product'}"? This action cannot be undone.`}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Delete Forever"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      <ModalAlert
        isOpen={state.showSuccessModal}
        title="Success"
        message={state.success || 'Operation completed successfully.'}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            showSuccessModal: false,
            success: null,
          }))
        }
        onConfirm={() =>
          setState((prev) => ({
            ...prev,
            showSuccessModal: false,
            success: null,
          }))
        }
        confirmText="OK"
        cancelText=""
      />

      {/* Error Modal */}
      <ModalAlert
        isOpen={state.showErrorModal}
        title="Error"
        message={state.error || 'An unexpected error occurred.'}
        onClose={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        onConfirm={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}
