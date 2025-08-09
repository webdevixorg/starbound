import { useCallback, useState, useMemo, useEffect } from 'react';
import { Review, ReviewDashboardState } from '@/types/review';
import {
  fetchAllReviews,
  updateReviewApproval,
  deleteReview,
  addAdminResponse,
} from '@/services/apiProducts';

export const useReviews = (isAuthorized: boolean, user: any) => {
  const [state, setState] = useState<ReviewDashboardState>({
    loading: true,
    reviews: [],
    filteredReviews: [],
    updatingId: null,
    deletingId: null,
    error: null,
    success: null,
    showErrorModal: false,
    showSuccessModal: false,
    showDeleteModal: false,
    showResponseModal: false,
    reviewToDelete: null,
    reviewToRespond: null,
    responseText: '',
    sortBy: 'newest',
    filterBy: 'all',
    ratingFilter: 'all',
    searchQuery: '',
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 20,
  });

  // Load reviews from backend
  const loadReviews = useCallback(async () => {
    if (!isAuthorized || !user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetchAllReviews();

      let reviews: Review[] = [];
      let totalCount = 0;

      if (Array.isArray(response)) {
        reviews = response;
        totalCount = response.length;
      } else if (response.results && Array.isArray(response.results)) {
        reviews = response.results;
        totalCount = response.count || response.results.length;
      } else if (response.data && Array.isArray(response.data)) {
        reviews = response.data;
        totalCount = response.data.length;
      }

      setState((prev) => ({
        ...prev,
        reviews: reviews,
        filteredReviews: reviews,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / prev.pageSize),
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading reviews:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load reviews. Please try again.',
        showErrorModal: true,
        loading: false,
      }));
    }
  }, [isAuthorized, user]);

  // Handle approval toggle
  const handleApprovalToggle = useCallback(
    async (id: number, status: number) => {
      setState((prev) => ({ ...prev, updatingId: id }));

      try {
        await updateReviewApproval(id, { status });

        setState((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
          updatingId: null,
          success: `Review ${
            status === 1
              ? 'approved'
              : status === 0
                ? 'set to pending'
                : 'moved to trash'
          } successfully.`,
          showSuccessModal: true,
        }));
      } catch (error) {
        console.error('Failed to update status:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to update approval status. Please try again.',
          showErrorModal: true,
          updatingId: null,
        }));
      }
    },
    []
  );

  // Handle review deletion
  const handleDeleteReview = useCallback(async (review: Review) => {
    setState((prev) => ({
      ...prev,
      deletingId: review.id,
      showDeleteModal: false,
    }));

    try {
      await deleteReview(review.id);

      setState((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== review.id),
        deletingId: null,
        reviewToDelete: null,
        success: 'Review deleted successfully.',
        showSuccessModal: true,
      }));
    } catch (error) {
      console.error('Error deleting review:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to delete review. Please try again.',
        showErrorModal: true,
        deletingId: null,
      }));
    }
  }, []);

  // Handle admin response
  const handleSubmitResponse = useCallback(async () => {
    if (!state.reviewToRespond || !state.responseText.trim()) return;

    setState((prev) => ({ ...prev, updatingId: state.reviewToRespond!.id }));

    try {
      await addAdminResponse(
        state.reviewToRespond.id,
        state.responseText.trim()
      );

      setState((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.id === state.reviewToRespond!.id
            ? {
                ...r,
                response: state.responseText.trim(),
                response_date: new Date().toISOString(),
              }
            : r
        ),
        showResponseModal: false,
        reviewToRespond: null,
        responseText: '',
        updatingId: null,
        success: 'Response saved successfully.',
        showSuccessModal: true,
      }));
    } catch (error) {
      console.error('Error saving response:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to save response. Please try again.',
        showErrorModal: true,
        updatingId: null,
      }));
    }
  }, [state.reviewToRespond, state.responseText]);

  return {
    state,
    setState,
    loadReviews,
    handleApprovalToggle,
    handleDeleteReview,
    handleSubmitResponse,
  };
};
