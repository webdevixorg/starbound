import { ApprovalResponse, Review, ReviewResponse } from '@/types/review';
import {
  createReview,
  fetchAllReviews,
  fetchReviewsByProductID,
  fetchReviewsByUserId,
  fetchReview,
  updateReviewApproval,
} from './apiProducts';
import axiosInstance from './AxiosInstance';

export const reviewService = {
  // ✅ Use existing function from apiProducts
  createReview,

  // ✅ Enhanced version of fetchAllReviews with pagination and filters
  async fetchAllReviews(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: number | null;
    rating?: number | null;
    ordering?: string;
  }): Promise<ReviewResponse> {
    try {
      // If no params provided, use the existing function
      if (!params || Object.keys(params).length === 0) {
        const data = await fetchAllReviews();
        return {
          count: data.length || 0,
          next: null,
          previous: null,
          results: Array.isArray(data) ? data : data.results || [],
        };
      }

      // Build query string for advanced filtering
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.append('page', params.page.toString());
      if (params.page_size)
        searchParams.append('page_size', params.page_size.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.status !== undefined && params.status !== null) {
        searchParams.append('status', params.status.toString());
      }
      if (params.rating)
        searchParams.append('rating', params.rating.toString());
      if (params.ordering) searchParams.append('ordering', params.ordering);

      const response = await axiosInstance.get(
        `/reviews/manage?${searchParams}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // ✅ Use existing functions
  fetchReviewsByProductID,
  fetchReviewsByUserId,
  fetchReview,

  // ✅ Enhanced updateReviewApproval with proper return type
  async updateReviewApproval(
    reviewId: number,
    status: number
  ): Promise<ApprovalResponse> {
    try {
      await updateReviewApproval(reviewId, { status });
      return {
        id: reviewId,
        status,
        message: `Review ${
          status === 1
            ? 'approved'
            : status === 0
              ? 'set to pending'
              : 'moved to trash'
        } successfully.`,
      };
    } catch (error) {
      console.error('Failed to update review approval:', error);
      throw new Error('Failed to update review approval');
    }
  },

  // ✅ New function for deleting reviews
  async deleteReview(reviewId: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/reviews/${reviewId}/`);
      return {
        message: 'Review deleted successfully.',
      };
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw new Error('Failed to delete review');
    }
  },

  // ✅ New function for adding admin responses
  async addAdminResponse(reviewId: number, response: string): Promise<Review> {
    try {
      const apiResponse = await axiosInstance.post(
        `/reviews/${reviewId}/response/`,
        {
          response: response,
        }
      );
      return apiResponse.data;
    } catch (error) {
      console.error('Failed to add admin response:', error);
      throw new Error('Failed to add admin response');
    }
  },

  // ✅ New function for bulk actions (optional)
  async bulkUpdateReviews(
    reviewIds: number[],
    action: 'approve' | 'disapprove' | 'delete'
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post('/reviews/bulk-action/', {
        review_ids: reviewIds,
        action: action,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      throw new Error(`Failed to ${action} reviews`);
    }
  },

  // ✅ User Review Management Functions

  /**
   * Get all active (approved) reviews for the logged-in user
   */
  async getUserReviews(): Promise<Review[]> {
    try {
      const response = await axiosInstance.get('/reviews/');
      const allReviews = response.data.results || response.data;

      // Filter for approved reviews only (status = 1)
      const activeReviews = Array.isArray(allReviews)
        ? allReviews.filter((review: any) => review.status === 1)
        : [];

      return activeReviews.map(this.transformReviewData);
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      throw error;
    }
  },

  /**
   * Update a user's review
   */
  async updateUserReview(
    reviewId: string | number,
    data: {
      rating: number;
      comment: string;
    }
  ): Promise<Review> {
    try {
      const response = await axiosInstance.patch(`/reviews/${reviewId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  },

  /**
   * Soft delete a user's review (move to trash by setting status to 2)
   */
  async deleteUserReview(reviewId: string | number): Promise<void> {
    try {
      // Soft delete by setting status to 2 (soft deleted/trash state)
      await axiosInstance.patch(`/reviews/${reviewId}/`, {
        status: 2,
      });
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  },

  /**
   * Get trashed reviews for the logged-in user
   */
  async getTrashedReviews(): Promise<Review[]> {
    try {
      const response = await axiosInstance.get('/reviews/');
      const allReviews = response.data.results || response.data;

      // Filter for soft deleted reviews (status = 2)
      const trashedReviews = Array.isArray(allReviews)
        ? allReviews.filter((review: any) => review.status === 2)
        : [];

      return trashedReviews.map(this.transformReviewData);
    } catch (error) {
      console.error('Failed to fetch trashed reviews:', error);
      throw error;
    }
  },

  /**
   * Get pending (not yet approved) reviews for the logged-in user
   */
  async getPendingReviews(): Promise<Review[]> {
    try {
      const response = await axiosInstance.get('/reviews/');
      const allReviews = response.data.results || response.data;

      // Filter for pending reviews (status = 0)
      const pendingReviews = Array.isArray(allReviews)
        ? allReviews.filter((review: any) => review.status === 0)
        : [];

      return pendingReviews.map(this.transformReviewData);
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error);
      throw error;
    }
  },

  /**
   * Get all reviews for the logged-in user (approved, pending, and trashed)
   */
  async getAllUserReviews(): Promise<Review[]> {
    try {
      const response = await axiosInstance.get('/reviews/');
      const allReviews = response.data.results || response.data;

      return Array.isArray(allReviews)
        ? allReviews.map(this.transformReviewData)
        : [];
    } catch (error) {
      console.error('Failed to fetch all user reviews:', error);
      throw error;
    }
  },

  /**
   * Restore a review from trash (set status back to 1)
   */
  async restoreUserReview(reviewId: string | number): Promise<Review> {
    try {
      const response = await axiosInstance.patch(`/reviews/${reviewId}/`, {
        status: 1,
      });
      return this.transformReviewData(response.data);
    } catch (error) {
      console.error('Failed to restore review:', error);
      throw error;
    }
  },

  /**
   * Permanently delete a review from trash
   * Note: This requires backend implementation of DELETE endpoint
   */
  async permanentlyDeleteReview(reviewId: string | number): Promise<void> {
    try {
      // Attempt hard delete - this will fail until backend implements DELETE
      await axiosInstance.delete(`/reviews/${reviewId}/`);
    } catch (error: any) {
      // If DELETE is not implemented, we can't do permanent deletion
      if (error.response?.status === 405) {
        throw new Error(
          'Permanent deletion is not supported by the backend yet. Contact administrator.'
        );
      }
      console.error('Failed to permanently delete review:', error);
      throw error;
    }
  },

  /**
   * Transform backend review data to frontend format
   */
  transformReviewData(backendReview: any): Review {
    return {
      id: backendReview.id,
      rating: backendReview.rating,
      comment: backendReview.comment || '',
      created_at: backendReview.created_at,
      updated_at: backendReview.updated_at,
      status: backendReview.status || 0, // Use numeric status directly: 0=pending, 1=approved, 2=trashed
      Name:
        backendReview.user?.first_name ||
        backendReview.user?.username ||
        'Anonymous',
      Email: backendReview.user?.email || '',
      ProfileImage: backendReview.user?.profile_image || '',
      product: {
        id: backendReview.product?.id || 0,
        title: backendReview.product?.title || 'Unknown Product',
        slug: backendReview.product?.slug || '',
        category: backendReview.product?.category || '',
      },
      user: backendReview.user
        ? {
            id: backendReview.user.id,
            username: backendReview.user.username,
            first_name: backendReview.user.first_name,
            last_name: backendReview.user.last_name,
          }
        : undefined,
      helpful_votes: backendReview.helpful_votes || 0,
      flagged: backendReview.flagged || false,
      response: backendReview.response || '',
      response_date: backendReview.response_date || '',
      wouldRecommend: backendReview.would_recommend || true,
      photos: backendReview.photos || [],
      verified: backendReview.status === 1, // Only approved reviews are verified
    };
  },

  /**
   * Get review status as string for UI display
   */
  getReviewStatus(statusValue: number): string {
    switch (statusValue) {
      case 0:
        return 'Pending Approval';
      case 1:
        return 'Approved';
      case 2:
        return 'Trashed';
      default:
        return 'Unknown';
    }
  },

  /**
   * Get review status color for UI styling
   */
  getReviewStatusColor(statusValue: number): string {
    switch (statusValue) {
      case 0:
        return 'yellow'; // Pending
      case 1:
        return 'green'; // Approved
      case 2:
        return 'red'; // Trashed
      default:
        return 'gray'; // Unknown
    }
  },
};
