import { Review } from './review';

export interface User {
  role: string;
  groups: any;
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface SignUp extends Omit<User, 'id'> {
  password: string;
}
export interface Profile {
  user: User;
  bio: string;
  image: string | any;
  phone: string;
  address: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  date_of_birth: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  signin: (tokens: { access: string; refresh: string }) => void;
  signout: () => void;
  user: User | null;
  role: 'admin' | 'customer' | null;
  profile: Profile | null;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// Define the ContentType type
export interface ContentType {
  model: any;
  id: number;
  name: string;
  description: string;
}

export interface ContentTypes {
  [key: string]: ContentType;
}

// Define the ContentContextType type
export interface ContentContextTypes {
  contentTypes: ContentTypes | null;
  loading: boolean;
}

export interface AccountSettings {
  username: string;
  twoFactorSMS: boolean;
  twoFactorTOTP: boolean;
  email: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ImageFile {
  file: File;
  order: number;
}

export interface Image {
  id: number;
  alt: string;
  image_path: string;
  order: number;
}

export interface Images {
  id: number;
  post: number;
  image: number;
  image_path: string;
  alt: string;
  order: number;
}

export interface Author {
  profile: {
    image: string;
    bio: string;
  };
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  content_type_id: string;
  children: Category[]; // Ensure this matches the expected type
}

interface CommonParams {
  title: string;
  description: string;
  slug: string;
  date: string;
  status: string;
  user: string;
}

export interface Post extends CommonParams {
  likes: number;
  comments: number;
  views: number;
  id: number;
  categories: Category[];
  author: Author;
  images: Images[];
  featured_image: string;
  aggregated_visitor_counts: number;
}

export interface PostData extends CommonParams {
  categories: number[];
  contentType: string;
  content_type_id: number; // Add content_type_id here
}

export interface FetchPostsResponse {
  data: Post[];
  totalPages: number;
}

// Base interfaces
export interface BaseProduct {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  additional_info: string;
  sku: string;
  status: string;
  date: string;
  featured_image?: string;
}

// Product pricing and inventory
export interface ProductPricing {
  price: number;
  original_price?: number;
  compare_price?: number;
  discount?: number;
}

export interface ProductInventory {
  stock_quantity: number;
  in_stock?: boolean;
}

// Product metadata
export interface ProductMetadata {
  rating?: number;
  reviews_count?: number;
  features?: string[];
  specifications?: Array<{
    name: string;
    value: string;
  }>;
}

// Location interfaces
export interface ProductLocation {
  location: number;
  sublocation: number;
}

export interface ProductLocationDetails {
  location_name: string;
  sublocation_name: string;
}

// Content management
export interface ContentManagement {
  contentType: string;
  content_type_id: number;
  user?: string;
}

// Complete Product interfaces
export interface ProductData
  extends BaseProduct,
    ProductPricing,
    ProductInventory,
    ProductLocation,
    ContentManagement {
  categories: number[]; // For API submission (category IDs)
}

export interface Product
  extends BaseProduct,
    ProductPricing,
    ProductInventory,
    ProductLocationDetails,
    ProductMetadata {
  categories: Category[]; // For display (full category objects)
  images: Images[];
  author: Author;
}

// Extended interfaces for specific use cases
export interface ExtendedProduct extends Product {
  // Additional fields that might come from API
  views?: number;
  likes?: number;
  comments_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type ProductFormData = Omit<ProductData, 'id' | 'date' | 'user'> & {
  // Form-specific overrides
  categories: Category[]; // Form uses full objects
  gallery_images?: ImageFile[];
  deleted_images?: number[];
};

// API response interfaces
export interface ProductListResponse {
  results: Product[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ProductResponse extends Product {
  // API might return additional fields
  related_products?: Product[];
  recent_reviews?: Review[];
}

// Helper type for product creation
export type CreateProductPayload = Omit<ProductData, 'id' | 'date'>;

// Helper type for product updates
export type UpdateProductPayload = Partial<Omit<ProductData, 'id'>>;

// Utility types
export type ProductStatus = 'Published' | 'Draft' | 'Deleted';
export type ProductSortBy =
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'newest'
  | 'oldest';
export type ProductFilterBy = 'all' | 'in_stock' | 'on_sale' | 'featured';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export interface Participant {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  image: any;
}

export interface Message {
  id: number;
  sender: number;
  sender_name: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: number;
  title: string;
  participants: Participant[];
  messages: Message[];
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: string;
  is_read: boolean;
  profile_image: string;
}

export interface Update {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: string;
  is_read: boolean;
  profile_image: string;
}

export interface Wishlist {
  id: number;
  destination: string;
  description: string;
}

export interface Location {
  id: number;
  name: string;
  subLocations?: SubLocation[];
}

export interface SubLocation {
  id: number;
  name: string;
  parent_id: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  parent_id: number;
}

export interface SideBarProps {
  onFilterChange: (Filters: []) => void;
  selectedLocation: string[];
  selectedCategory: string[];
  onClearAllFilters: () => void;
}

export interface Filter {
  type:
    | 'locations'
    | 'categories'
    | 'sublocations'
    | 'subcategories'
    | 'price'
    | 'query';
  id: number;
  name: string;
  min?: number;
  max?: number;
}

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface Visit {
  id?: number; // backend visit id may exist
  item_id: number;
  item_type: string;
  timestamp: string; // ISO string
  [key: string]: any; // extra fields allowed
}
