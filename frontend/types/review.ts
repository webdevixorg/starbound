export interface Review {
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

export interface ReviewDashboardState {
  loading: boolean;
  reviews: Review[];
  filteredReviews: Review[];
  updatingId: number | null;
  deletingId: number | null;
  error: string | null;
  success: string | null;
  showErrorModal: boolean;
  showSuccessModal: boolean;
  showDeleteModal: boolean;
  showResponseModal: boolean;
  reviewToDelete: Review | null;
  reviewToRespond: Review | null;
  responseText: string;
  sortBy:
    | 'newest'
    | 'oldest'
    | 'rating-high'
    | 'rating-low'
    | 'name'
    | 'product';
  filterBy: 'all' | 'approved' | 'pending' | 'flagged';
  ratingFilter: 'all' | '1' | '2' | '3' | '4' | '5';
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

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
