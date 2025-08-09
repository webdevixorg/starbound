import { useMemo } from 'react';
import { Review } from '@/types/review';

export const useReviewFilters = (
  reviews: Review[],
  searchQuery: string,
  filterBy: string,
  ratingFilter: string,
  sortBy: string,
  currentPage: number,
  pageSize: number
) => {
  // Filter and sort reviews
  const processedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.Name.toLowerCase().includes(query) ||
          review.Email.toLowerCase().includes(query) ||
          review.comment.toLowerCase().includes(query) ||
          review.product?.title.toLowerCase().includes(query)
      );
    }

    // Apply approval filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'approved':
          filtered = filtered.filter((review) => review.status === 1);
          break;
        case 'pending':
          filtered = filtered.filter((review) => review.status === 0);
          break;
        case 'flagged':
          filtered = filtered.filter((review) => review.flagged);
          break;
      }
    }

    // Apply rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter((review) => review.rating === rating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case 'oldest':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'name':
          return a.Name.localeCompare(b.Name);
        case 'product':
          return (a.product?.title || '').localeCompare(b.product?.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, searchQuery, filterBy, ratingFilter, sortBy]);

  // Paginate processed reviews
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedReviews.slice(startIndex, endIndex);
  }, [processedReviews, currentPage, pageSize]);

  const totalPages = Math.ceil(processedReviews.length / pageSize);

  return {
    processedReviews,
    paginatedReviews,
    totalPages,
    totalCount: processedReviews.length,
  };
};
