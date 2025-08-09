'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAuthRedirect';
import { useReviews } from '@/hooks/useReviews';
import { useReviewFilters } from '@/hooks/useReviewFilters';
import LoadingSpinner from '@/components/Common/Loading';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import ModalAlert from '@/components/Modals/ModalAlert';
import { ReviewStats } from '@/components/Reviews/ReviewStats';
import { ReviewFilters } from '@/components/Reviews/ReviewFilters';
import { ReviewTable } from '@/components/Reviews/ReviewTable';
import { ReviewPagination } from '@/components/Reviews/ReviewPagination';
import { ReviewResponseModal } from '@/components/Reviews/ReviewResponseModal';

export default function ReviewDashboardPage() {
  // ✅ Track if data has been loaded to prevent multiple calls
  const hasLoadedRef = useRef(false);

  // ✅ Using the custom authentication hook
  const {
    isClient,
    isLoading: authLoading,
    isAuthorized,
    user,
  } = useAdminAuth();

  // ✅ Using custom review management hook
  const {
    state,
    setState,
    loadReviews,
    handleApprovalToggle,
    handleDeleteReview,
    handleSubmitResponse,
  } = useReviews(isAuthorized, user);

  // ✅ Using custom filter hook
  const { paginatedReviews, totalPages, totalCount } = useReviewFilters(
    state.reviews,
    state.searchQuery,
    state.filterBy,
    state.ratingFilter,
    state.sortBy,
    state.currentPage,
    state.pageSize
  );

  // ✅ Update pagination info - Fixed dependencies
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      filteredReviews: paginatedReviews,
      totalCount: totalCount,
      totalPages: Math.max(1, totalPages),
      currentPage: Math.min(prev.currentPage, Math.max(1, totalPages)),
    }));
  }, [paginatedReviews, totalCount, totalPages]); // ✅ Removed setState from dependencies

  // ✅ Initial load when authorized - Fixed to prevent infinite loops
  useEffect(() => {
    if (isAuthorized && user?.role === 'admin' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadReviews();
    }
  }, [isAuthorized, user?.role, loadReviews]);

  // ✅ Manual refresh function
  const handleRefresh = useCallback(async () => {
    await loadReviews();
  }, [loadReviews]);

  // ✅ Handle modal actions
  const handleDeleteClick = useCallback(
    (review: any) => {
      setState((prev) => ({
        ...prev,
        reviewToDelete: review,
        showDeleteModal: true,
      }));
    },
    [setState]
  );

  const confirmDelete = useCallback(async () => {
    if (state.reviewToDelete) {
      await handleDeleteReview(state.reviewToDelete);
    }
  }, [state.reviewToDelete, handleDeleteReview]);

  const cancelDelete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showDeleteModal: false,
      reviewToDelete: null,
    }));
  }, [setState]);

  const handleResponseClick = useCallback(
    (review: any) => {
      setState((prev) => ({
        ...prev,
        reviewToRespond: review,
        responseText: review.response || '',
        showResponseModal: true,
      }));
    },
    [setState]
  );

  const cancelResponse = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showResponseModal: false,
      reviewToRespond: null,
      responseText: '',
    }));
  }, [setState]);

  // ✅ Handle filters and search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({
        ...prev,
        searchQuery: e.target.value,
        currentPage: 1,
      }));
    },
    [setState]
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setState((prev) => ({
        ...prev,
        sortBy: e.target.value as any,
        currentPage: 1,
      }));
    },
    [setState]
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setState((prev) => ({
        ...prev,
        filterBy: e.target.value as any,
        currentPage: 1,
      }));
    },
    [setState]
  );

  const handleRatingFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setState((prev) => ({
        ...prev,
        ratingFilter: e.target.value as any,
        currentPage: 1,
      }));
    },
    [setState]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= state.totalPages) {
        setState((prev) => ({ ...prev, currentPage: newPage }));
      }
    },
    [state.totalPages, setState]
  );

  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchQuery: '',
      filterBy: 'all',
      ratingFilter: 'all',
      sortBy: 'newest',
      currentPage: 1,
    }));
  }, [setState]);

  // Utility functions
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // ✅ Loading states
  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-200">
                  <div className="flex space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">Loading reviews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Auth check
  if (!isAuthorized) {
    return null;
  }

  const showClearFilters =
    state.searchQuery ||
    state.filterBy !== 'all' ||
    state.ratingFilter !== 'all' ||
    state.sortBy !== 'newest';

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ADMIN ACCESS - {user?.first_name} {user?.last_name}
          </span>
        </div>

        {/* Breadcrumbs */}
        <div className="mb-8">
          <BreadcrumbsComponent />
        </div>

        {/* ✅ Statistics Cards */}
        <ReviewStats reviews={state.reviews} />

        {/* ✅ Search and Filters */}
        <ReviewFilters
          searchQuery={state.searchQuery}
          filterBy={state.filterBy}
          ratingFilter={state.ratingFilter}
          sortBy={state.sortBy}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onRatingFilterChange={handleRatingFilterChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
          showClearFilters={!!showClearFilters}
        />

        {/* Results Count & Refresh Button */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {(state.currentPage - 1) * state.pageSize + 1} to{' '}
            {Math.min(state.currentPage * state.pageSize, state.totalCount)} of{' '}
            {state.totalCount} reviews
            {showClearFilters && (
              <span className="text-gray-500">
                {' '}
                (filtered from {state.reviews.length} total)
              </span>
            )}
          </p>

          <button
            onClick={handleRefresh} // ✅ Use separate refresh function
            disabled={state.loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4 mr-1"
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
            {state.loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* ✅ Reviews Table or Empty State */}
        {state.filteredReviews.length === 0 ? (
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showClearFilters ? 'No reviews found' : 'No reviews yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showClearFilters
                ? 'No reviews match your current filters. Try adjusting your search criteria.'
                : 'Reviews will appear here once customers start leaving feedback.'}
            </p>
            {showClearFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <ReviewTable
              reviews={state.filteredReviews}
              updatingId={state.updatingId}
              deletingId={state.deletingId}
              onApprovalToggle={handleApprovalToggle}
              onResponseClick={handleResponseClick}
              onDeleteClick={handleDeleteClick}
              formatDate={formatDate}
            />

            <ReviewPagination
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* ✅ Response Modal */}
      <ReviewResponseModal
        isOpen={state.showResponseModal}
        review={state.reviewToRespond}
        responseText={state.responseText}
        isUpdating={state.updatingId === state.reviewToRespond?.id}
        onClose={cancelResponse}
        onResponseChange={(text) =>
          setState((prev) => ({ ...prev, responseText: text }))
        }
        onSubmit={handleSubmitResponse}
      />

      {/* ✅ Delete Confirmation Modal */}
      <ModalAlert
        isOpen={state.showDeleteModal}
        title="Delete Review"
        message={`Are you sure you want to delete this review by ${state.reviewToDelete?.Name}? This action cannot be undone.`}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* ✅ Success Modal */}
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

      {/* ✅ Error Modal */}
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
