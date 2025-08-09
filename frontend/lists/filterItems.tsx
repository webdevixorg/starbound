export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating-high', label: 'Highest Rating' },
  { value: 'rating-low', label: 'Lowest Rating' },
  { value: 'name', label: 'Customer Name' },
  { value: 'product', label: 'Product Name' },
] as const;

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All Reviews' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'flagged', label: 'Flagged' },
] as const;

export const RATING_FILTER_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
] as const;
