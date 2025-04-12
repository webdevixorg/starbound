export interface User {
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
  map(arg0: (contentType: any) => boolean): unknown;
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

interface ProductParams extends CommonParams {
  price: number;
  sku: string;
  children?: Category[];
  short_description: string;
  additional_info: string;
}

export interface ProductData extends ProductParams {
  categories: number[];
  contentType: string;
  content_type_id: number; // Add content_type_id here
  location: number;
  sublocation: number;
}

export interface Product extends ProductParams {
  id: number;
  categories: Category[];
  location_name: string;
  sublocation_name: string;
  category_name: string;
  images: Images[];
  author: Author;
}

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
  type: 'locations' | 'sublocations' | 'categories' | 'subcategories';
  id: number;
  name: string;
  parent_id?: number;
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
