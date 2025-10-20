/**
 * Sorting options for the reviews list.
 * Each option contains:
 * - value: The sort key used in the API request
 * - label: Human-readable text shown in the UI
 */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' }, // Sort by creation date descending
  { value: 'oldest', label: 'Oldest First' }, // Sort by creation date ascending
  { value: 'rating-high', label: 'Highest Rating' }, // Sort by rating 5->1
  { value: 'rating-low', label: 'Lowest Rating' }, // Sort by rating 1->5
  { value: 'name', label: 'Customer Name' }, // Sort alphabetically by customer name
  { value: 'product', label: 'Product Name' }, // Sort alphabetically by product name
] as const;

/**
 * Filter options for review status.
 * Used to filter reviews based on their current moderation status:
 * - all: Show all reviews regardless of status
 * - pending: Reviews awaiting moderation
 * - approved: Reviews that have been approved by moderators
 * - flagged: Reviews that have been marked for review
 */
export const FILTER_OPTIONS = [
  { value: 'all', label: 'All Reviews' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'flagged', label: 'Flagged' },
] as const;

/**
 * Filter options for review ratings.
 * Allows filtering reviews by their star rating (1-5).
 * 'all' option shows reviews of any rating.
 * The values are strings to match form input values.
 */
export const RATING_FILTER_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
] as const;
