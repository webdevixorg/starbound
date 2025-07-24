import {
  createReview,
  fetchAllReviews,
  fetchReviewsByProductID,
  fetchReviewsByUserId,
  fetchReview,
  updateReviewApproval,
} from './apiProducts';
import axiosInstance from './AxiosInstance';

interface ReviewResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

interface ApprovalResponse {
  id: number;
  approved: boolean;
  message: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
  approved: boolean;
  Name: string;
  Email: string;
  ProfileImage?: string;
  product?: {
    id: number;
    title: string;
    slug?: string;
    category?: string;
  };
  user?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  helpful_votes?: number;
  flagged?: boolean;
  response?: string;
  response_date?: string;
}

export const reviewService = {
  // ✅ Use existing function from apiProducts
  createReview,

  // ✅ Enhanced version of fetchAllReviews with pagination and filters
  async fetchAllReviews(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    approved?: boolean | null;
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
      if (params.approved !== undefined && params.approved !== null) {
        searchParams.append('approved', params.approved.toString());
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
    approved: boolean
  ): Promise<ApprovalResponse> {
    try {
      await updateReviewApproval(reviewId, { approved });
      return {
        id: reviewId,
        approved,
        message: `Review ${
          approved ? 'approved' : 'disapproved'
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
};
