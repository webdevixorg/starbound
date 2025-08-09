export interface Review {
  verified: any;
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
  status: number;
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
  wouldRecommend: boolean;
  photos?: { url: string; caption?: string }[];
}

export interface ReviewResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

export interface ApprovalResponse {
  id: number;
  status: number;
  message: string;
}

export interface ReviewsState {
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

export interface EditReviewForm {
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  wouldRecommend: boolean;
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

export interface TrashState {
  loading: boolean;
  reviews: Review[];
  restoring: string | null;
  deleting: string | null;
  error: string | null;
  success: string | null;
  showRestoreModal: boolean;
  showDeleteModal: boolean;
  showErrorModal: boolean;
  showSuccessModal: boolean;
  reviewToRestore: Review | null;
  reviewToDelete: Review | null;
  isClient: boolean;
}
