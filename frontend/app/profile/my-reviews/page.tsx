'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';
import Image from 'next/image';

interface Review {
  id: string | number;
  destination: {
    id: string | number;
    title: string;
    location: string;
    images?: { image_path: string; alt?: string }[];
    slug?: string;
  };
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  visitDate: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  helpfulVotes: number;
  verified: boolean;
  photos?: { url: string; caption?: string }[];
}

interface ReviewsState {
  loading: boolean;
  reviews: Review[];
  filteredReviews: Review[];
  deleting: string | null;
  editing: string | null;
  error: string | null;
  success: string | null;
  showDeleteModal: boolean;
  showEditModal: boolean;
  showErrorModal: boolean;
  showSuccessModal: boolean;
  reviewToDelete: Review | null;
  reviewToEdit: Review | null;
  isClient: boolean;
  sortBy: 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful';
  filterBy: 'all' | '1' | '2' | '3' | '4' | '5';
  searchQuery: string;
}

interface EditReviewForm {
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  wouldRecommend: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating-high', label: 'Highest Rating' },
  { value: 'rating-low', label: 'Lowest Rating' },
  { value: 'helpful', label: 'Most Helpful' },
] as const;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Reviews' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
] as const;

// Mock data for development
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    destination: {
      id: '1',
      title: 'Santorini, Greece',
      location: 'Cyclades, Greece',
      images: [{ image_path: '/destinations/santorini.jpg', alt: 'Santorini' }],
      slug: 'santorini-greece',
    },
    rating: 5,
    title: 'Absolutely breathtaking!',
    content:
      'Our trip to Santorini was everything we dreamed of and more. The sunsets are truly spectacular, and the white-washed buildings create such a romantic atmosphere.',
    pros: [
      'Amazing sunsets',
      'Beautiful architecture',
      'Great food',
      'Romantic atmosphere',
    ],
    cons: ['Can be crowded', 'Expensive dining'],
    wouldRecommend: true,
    visitDate: '2024-06-15',
    createdAt: '2024-06-20T10:30:00Z',
    likes: 24,
    helpfulVotes: 18,
    verified: true,
  },
  {
    id: '2',
    destination: {
      id: '2',
      title: 'Bali, Indonesia',
      location: 'Indonesia',
      images: [{ image_path: '/destinations/bali.jpg', alt: 'Bali' }],
      slug: 'bali-indonesia',
    },
    rating: 4,
    title: 'Great cultural experience',
    content:
      'Bali offers an incredible mix of culture, nature, and relaxation. The temples are magnificent and the people are very welcoming.',
    pros: [
      'Rich culture',
      'Beautiful temples',
      'Affordable',
      'Friendly locals',
    ],
    cons: ['Traffic can be heavy', 'Some areas very touristy'],
    wouldRecommend: true,
    visitDate: '2024-05-10',
    createdAt: '2024-05-15T14:20:00Z',
    likes: 15,
    helpfulVotes: 12,
    verified: true,
  },
];

export default function ReviewsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [state, setState] = useState<ReviewsState>({
    loading: true,
    reviews: [],
    filteredReviews: [],
    deleting: null,
    editing: null,
    error: null,
    success: null,
    showDeleteModal: false,
    showEditModal: false,
    showErrorModal: false,
    showSuccessModal: false,
    reviewToDelete: null,
    reviewToEdit: null,
    isClient: false,
    sortBy: 'newest',
    filterBy: 'all',
    searchQuery: '',
  });

  const [editForm, setEditForm] = useState<EditReviewForm>({
    rating: 5,
    title: '',
    content: '',
    pros: '',
    cons: '',
    wouldRecommend: true,
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

  // Load reviews
  const loadReviews = useCallback(async () => {
    if (!state.isClient || !user) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const reviews = MOCK_REVIEWS;

      setState((prev) => ({
        ...prev,
        reviews,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading reviews:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load your reviews. Please try again.',
        showErrorModal: true,
        loading: false,
      }));
    }
  }, [state.isClient, user]);

  // Initial load
  useEffect(() => {
    if (state.isClient && user) {
      loadReviews();
    }
  }, [loadReviews, state.isClient, user]);

  // Filter and sort reviews
  useEffect(() => {
    let filtered = state.reviews;

    // Apply search filter
    if (state.searchQuery) {
      filtered = filtered.filter(
        (review) =>
          review.destination.title
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          review.title
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          review.content.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }

    // Apply rating filter
    if (state.filterBy !== 'all') {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(state.filterBy)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpfulVotes - a.helpfulVotes;
        case 'newest':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    setState((prev) => ({ ...prev, filteredReviews: filtered }));
  }, [state.reviews, state.searchQuery, state.filterBy, state.sortBy]);

  // Handle delete review
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
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setState((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== state.reviewToDelete!.id),
        deleting: null,
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
        deleting: null,
      }));
    }
  }, [state.reviewToDelete]);

  const cancelDelete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showDeleteModal: false,
      reviewToDelete: null,
    }));
  }, []);

  // Handle edit review
  const handleEditClick = useCallback((review: Review) => {
    setEditForm({
      rating: review.rating,
      title: review.title,
      content: review.content,
      pros: review.pros?.join(', ') || '',
      cons: review.cons?.join(', ') || '',
      wouldRecommend: review.wouldRecommend,
    });

    setState((prev) => ({
      ...prev,
      reviewToEdit: review,
      showEditModal: true,
    }));
  }, []);

  const handleEditFormChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      setEditForm((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : name === 'rating'
            ? parseInt(value)
            : value,
      }));
    },
    []
  );

  const submitEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!state.reviewToEdit) return;

      setState((prev) => ({
        ...prev,
        editing: String(state.reviewToEdit!.id),
      }));

      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

        const updatedReview: Review = {
          ...state.reviewToEdit,
          ...editForm,
          pros: editForm.pros
            ? editForm.pros
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          cons: editForm.cons
            ? editForm.cons
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          updatedAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === state.reviewToEdit!.id ? updatedReview : r
          ),
          editing: null,
          reviewToEdit: null,
          showEditModal: false,
          success: 'Review updated successfully.',
          showSuccessModal: true,
        }));
      } catch (error) {
        console.error('Error updating review:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to update review. Please try again.',
          showErrorModal: true,
          editing: null,
        }));
      }
    },
    [state.reviewToEdit, editForm]
  );

  const cancelEdit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showEditModal: false,
      reviewToEdit: null,
      editing: null,
    }));
  }, []);

  // Handle filters and search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, searchQuery: e.target.value }));
    },
    []
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setState((prev) => ({ ...prev, sortBy: e.target.value as any }));
    },
    []
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setState((prev) => ({ ...prev, filterBy: e.target.value as any }));
    },
    []
  );

  // Utility functions
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const renderStars = useCallback(
    (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
      const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      };

      return (
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`${sizeClasses[size]} ${
                index < rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1 text-sm text-gray-600">({rating})</span>
        </div>
      );
    },
    []
  );

  // Loading skeleton for SSR compatibility
  if (!state.isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
              <p className="mt-1 text-sm text-gray-600">
                {state.filteredReviews.length} review
                {state.filteredReviews.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <button
              onClick={() => router.push('/profile')}
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
              Back to Profile
            </button>
          </div>
        </div>

        {state.reviews.length > 0 && (
          /* Controls */
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                  </div>
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={state.searchQuery}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Filter by Rating */}
                <select
                  value={state.filterBy}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={state.sortBy}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
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
              {state.searchQuery ? 'No reviews found' : 'No reviews yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {state.searchQuery
                ? `No reviews match "${state.searchQuery}". Try a different search term.`
                : 'Start sharing your travel experiences by writing your first review!'}
            </p>
            {!state.searchQuery && (
              <button
                onClick={() => router.push('/destinations')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Explore Destinations
              </button>
            )}
          </div>
        ) : (
          /* Reviews List */
          <div className="space-y-6">
            {state.filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      {/* Destination Image */}
                      <div className="flex-shrink-0">
                        {review.destination.images?.[0]?.image_path ? (
                          <Image
                            src={review.destination.images[0].image_path}
                            alt={
                              review.destination.images[0].alt ||
                              review.destination.title
                            }
                            width={80}
                            height={60}
                            className="w-20 h-15 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-400"
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

                      {/* Review Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3
                            className="text-lg font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/destinations/${review.destination.slug}`
                              )
                            }
                          >
                            {review.destination.title}
                          </h3>
                          {review.verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {review.destination.location}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Visited: {formatDate(review.visitDate)}</span>
                          <span>•</span>
                          <span>Reviewed: {formatDate(review.createdAt)}</span>
                          {review.updatedAt && (
                            <>
                              <span>•</span>
                              <span>
                                Updated: {formatDate(review.updatedAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(review)}
                        disabled={state.editing === String(review.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {state.editing === String(review.id) ? (
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteClick(review)}
                        disabled={state.deleting === String(review.id)}
                        className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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

                  {/* Rating and Title */}
                  <div className="mb-4">
                    {renderStars(review.rating)}
                    <h4 className="text-xl font-semibold text-gray-900 mt-2">
                      {review.title}
                    </h4>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {review.content}
                    </p>
                  </div>

                  {/* Pros and Cons */}
                  {(review.pros?.length || review.cons?.length) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {review.pros && review.pros.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Pros
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {review.pros.map((pro, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {review.cons && review.cons.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Cons
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {review.cons.map((con, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {review.likes} likes
                      </span>

                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {review.helpfulVotes} found helpful
                      </span>
                    </div>

                    <div className="flex items-center">
                      {review.wouldRecommend ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Would Recommend
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Would Not Recommend
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      {state.showEditModal && state.reviewToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Review for {state.reviewToEdit.destination.title}
              </h3>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={submitEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating *
                  </label>
                  <select
                    name="rating"
                    value={editForm.rating}
                    onChange={handleEditFormChange}
                    disabled={state.editing === String(state.reviewToEdit.id)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    required
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Would Recommend */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Would Recommend
                  </label>
                  <select
                    name="wouldRecommend"
                    value={editForm.wouldRecommend.toString()}
                    onChange={handleEditFormChange}
                    disabled={state.editing === String(state.reviewToEdit.id)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="true">Yes, I would recommend</option>
                    <option value="false">No, I would not recommend</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Review Title *
                </label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  disabled={state.editing === String(state.reviewToEdit.id)}
                  placeholder="Give your review a title"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="edit-content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Review Content *
                </label>
                <textarea
                  id="edit-content"
                  name="content"
                  rows={6}
                  value={editForm.content}
                  onChange={handleEditFormChange}
                  disabled={state.editing === String(state.reviewToEdit.id)}
                  placeholder="Share your experience..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 resize-vertical"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <div>
                  <label
                    htmlFor="edit-pros"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    What did you like? (Optional)
                  </label>
                  <textarea
                    id="edit-pros"
                    name="pros"
                    rows={3}
                    value={editForm.pros}
                    onChange={handleEditFormChange}
                    disabled={state.editing === String(state.reviewToEdit.id)}
                    placeholder="Separate with commas"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 resize-vertical"
                  />
                </div>

                {/* Cons */}
                <div>
                  <label
                    htmlFor="edit-cons"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    What could be improved? (Optional)
                  </label>
                  <textarea
                    id="edit-cons"
                    name="cons"
                    rows={3}
                    value={editForm.cons}
                    onChange={handleEditFormChange}
                    disabled={state.editing === String(state.reviewToEdit.id)}
                    placeholder="Separate with commas"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 resize-vertical"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={state.editing === String(state.reviewToEdit.id)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    state.editing === String(state.reviewToEdit.id) ||
                    !editForm.title.trim() ||
                    !editForm.content.trim()
                  }
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.editing === String(state.reviewToEdit.id) ? (
                    <>
                      <InlineLoaderIcon className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ModalAlert
        isOpen={state.showDeleteModal}
        title="Delete Review"
        message={`Are you sure you want to delete your review for "${state.reviewToDelete?.destination.title}"? This action cannot be undone.`}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Delete"
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
