import axios, { AxiosResponse } from 'axios';
import { Image, Product } from '../types/types'; // Adjust the import path as necessary
import axiosInstance from './AxiosInstance';
import axiosInstanceNoAuth from './AxiosInstanceNoAuth';
import {
  AuthResponse,
  SignUp,
  Profile,
  AccountSettings,
  FAQ,
  Conversation,
  Message,
  User,
  Post,
  Category,
  PostData,
  ImageFile,
} from '../types/types'; // Adjust the import path as necessary

export const fetchData = async (url: string) => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

export const signup = (userData: SignUp): Promise<AxiosResponse<void>> => {
  return axiosInstanceNoAuth.post<void>('/signup/', userData);
};

export const signin = (userData: {
  username: string;
  password: string;
}): Promise<AxiosResponse<AuthResponse>> => {
  return axiosInstanceNoAuth.post<AuthResponse>('/signin/', userData);
};

export const fetchUser = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get('/profile');
    return response.data.user; // Assuming backend responds with user data
  } catch (error) {
    throw new Error('Failed to fetch user data'); // Handle specific error cases if needed
  }
};

export const fetchProfile = async (): Promise<Profile> => {
  try {
    const response = await axiosInstance.get('/profile/');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData: FormData): Promise<void> => {
  try {
    // Make a PUT request to update the profile using axiosInstance
    await axiosInstance.put('/profile/', profileData);
  } catch (error) {
    // Log any errors that occur during the request
    console.error('Error updating profile:', error);
    throw error; // Re-throw the error for further handling if needed
  }
};

export const fetchAccountSettings = async (): Promise<AccountSettings> => {
  try {
    const response = await axiosInstance.get('/account-settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching account settings:', error);
    throw error;
  }
};

export const updateAccountSettings = async (
  settingsData: Partial<AccountSettings>
): Promise<void> => {
  try {
    const response = await axiosInstance.put(
      '/account-settings/update/',
      settingsData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating account settings:', error);
    throw error;
  }
};

export const uploadImage = async (
  file: ImageFile,
  title: string,
  id: number,
  type: number
) => {
  const formData = new FormData();
  formData.append('image_path', file.file); // Correct field name for the file
  formData.append('alt', title);
  formData.append('object_id', id.toString()); // Correct field name for the object ID
  formData.append('order', file.order.toString()); // Correct field name for the object ID
  formData.append('content_type', type.toString()); // Correct field name for the content type

  try {
    const response = await axiosInstance.post('/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status !== 201) {
      throw new Error('Image upload failed');
    }

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const fetchImagesByObjectId = async (
  objectId: number
): Promise<Image> => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.get('/images/', {
      params: {
        object_id: objectId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching image by object ID:', error);
    throw error;
  }
};

// Function to update the image order
export const updateImage = async (imageId: number, data: { order: number }) => {
  try {
    const response = await axiosInstance.patch(`/images/${imageId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating order for image ${imageId}:`, error);
    throw error;
  }
};

export const deleteImage = async (imageId: number) => {
  try {
    const response = await axiosInstance.delete(`/images/${imageId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 204) {
      throw new Error('Image deletion failed');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Error deleting image:',
        error.response?.data || error.message
      );
    } else {
      console.error('Unexpected error deleting image:', error);
    }
    throw error;
  }
};

// api.tsx

export const fetchPosts = async (
  page: number = 1,
  pageSize: number = 10,
  status: string,
  filter: string = '',
  modelName: string
): Promise<{
  page_size: number;
  results: Post[];
  count: number;
  next: string | null;
  previous: string | null;
}> => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.get(
      `/${modelName}s/${filter}`,
      {
        params: { page, pageSize, status: status },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchPostsForSections = async (
  filter: string,
  count: number
): Promise<{
  results: Post[];
}> => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.get(
      `/posts/${filter}/`,
      {
        params: { count },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchPostBySlug = async (slug: string): Promise<Post> => {
  try {
    const { data: postData }: AxiosResponse = await axiosInstanceNoAuth.get(
      `/posts/${slug}`
    );

    // Fetch category details in parallel
    const categories: Category[] = await Promise.all(
      postData.categories.map((categoryId: number) =>
        axiosInstanceNoAuth
          .get(`/categories/${categoryId}`)
          .then((res) => res.data)
      )
    );

    return { ...postData, categories };
    alert(categories);
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const createPost = async (data: PostData): Promise<Post> => {
  try {
    // Convert PostData to FormData
    const formData = new FormData();
    const appendToFormData = (key: string, value: any) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item.toString()));
      } else {
        formData.append(key, value.toString());
      }
    };

    (Object.keys(data) as (keyof PostData)[]).forEach((key) => {
      appendToFormData(key, data[key]);
    });

    // Send the formData to the backend
    const response = await axiosInstance.post(
      `/${data.contentType}s/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    if (axios.isAxiosError(error) && error.response) {
      // Handle Axios error
      throw new Error(error.response.data.message || 'Failed to create post');
    }
    throw error;
  }
};

export const updatePost = async (
  slug: string,
  data: PostData
): Promise<Post> => {
  try {
    // Convert PostData to FormData
    const formData = new FormData();
    const appendToFormData = (key: string, value: any) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item.toString()));
      } else {
        formData.append(key, value.toString());
      }
    };

    (Object.keys(data) as (keyof PostData)[]).forEach((key) => {
      appendToFormData(key, data[key]);
    });

    // Send the formData to the backend
    const response = await axiosInstance.put(
      `/${data.contentType}s/${slug}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to update post');
    }
    throw new Error('An unexpected error occurred while updating the post');
  }
};

const statusErrorMessages: { [key: string]: string } = {
  Deleted: 'Error deleting post:',
  Active: 'Error restoring post:',
  Published: 'Error publishing post:',
  Archived: 'Error archiving post:',
  Draft: 'Error drafting post:',
};

export const changePostStatus = async (
  slug: string,
  contentType: string,
  status: string
) => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.patch(
      `/${contentType}s/${slug}/change-status/`,
      {
        status: status,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage =
      statusErrorMessages[status] || 'Error processing post:';
    console.error(errorMessage, error);
    throw error;
  }
};

export const deletePost = async (
  slug: string,
  contentType: string
): Promise<void> => {
  try {
    const response = await axiosInstance.delete(
      `/${contentType}s/${slug}/delete/`
    );
    if (response.status !== 204) {
      throw new Error('Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const fetchTrips = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/trips');
    return response.data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

export const fetchHistory = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/history/');
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

export const fetchWishlist = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/wishlist/');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

const currencyApiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
const countriesApiUrl = 'https://restcountries.com/v3.1/all';

export const fetchCurrencyData = async () => {
  try {
    const [currencyResponse, countriesResponse] = await Promise.all([
      axios.get(currencyApiUrl),
      axios.get(countriesApiUrl),
    ]);

    const currencyRates = currencyResponse.data.rates;
    const countries = countriesResponse.data;

    const currencyFlags: { [key: string]: string } = {};

    countries.forEach((country: any) => {
      if (country.currencies) {
        Object.keys(country.currencies).forEach((currency) => {
          currencyFlags[currency] = country.cca2.toLowerCase();
        });
      }
    });

    return { currencyRates, currencyFlags };
  } catch (error) {
    console.error('Error fetching currency data:', error);
    throw error;
  }
};

export const fetchFAQs = async (): Promise<FAQ[]> => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.get('/faqs/');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

export const fetchFAQ = async (id: number): Promise<FAQ> => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.get(
      `/faqs/${id}/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching FAQ with id ${id}:`, error);
    throw error;
  }
};

export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await axiosInstance.get('/chat/');
    return response.data; // Assuming response.data is an array of conversations
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const fetchMessages = async (
  conversationId: number
): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get(
      `/chat/${conversationId}/messages/`
    );
    return response.data; // Assuming response.data contains the messages array
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (
  conversationId: number,
  messageData: Message
): Promise<Message> => {
  try {
    // Convert BigInt id to string if necessary
    const messageToSend = {
      ...messageData,
      id: messageData.id.toString(),
    };

    const response = await axiosInstance.put<Message>(
      `/chat/${conversationId}/`,
      messageToSend
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const fetchNotifications = async (
  pageNumber: number,
  pageSize: number
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/notifications/', {
      params: {
        page: pageNumber,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching notifications');
  }
};

export const markNotificationAsRead = async (
  notificationId: number
): Promise<void> => {
  try {
    await axiosInstance.put(`/notifications/${notificationId}/`, {
      is_read: true,
    });
  } catch (error) {
    throw new Error('Error marking notification as read');
  }
};

export const fetchUpdates = async (
  pageNumber: number,
  pageSize: number
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/updates/', {
      params: {
        page: pageNumber,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching updates');
  }
};

export const markUpdateAsRead = async (Id: number): Promise<void> => {
  try {
    await axiosInstance.put(`/ updates/${Id}/`, {
      is_read: true,
    });
  } catch (error) {
    throw new Error('Error marking update as read');
  }
};

export const fetchProducts = async (
  orderBy: string,
  page: number,
  limit: number,
  filters: { type: string; id: number }[]
) => {
  // Validate parameters
  if (typeof orderBy !== 'string' || orderBy.trim() === '') {
    throw new Error('Invalid orderBy parameter');
  }
  if (!Number.isInteger(page) || page <= 0) {
    throw new Error('Invalid page parameter');
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('Invalid limit parameter');
  }

  // Construct URL
  let url = `/products/?orderBy=${encodeURIComponent(
    orderBy
  )}&page=${page}&limit=${limit}`;
  filters.forEach((filter) => {
    url += `&${encodeURIComponent(filter.type)}=${encodeURIComponent(
      filter.id
    )}`;
  });

  // Fetch data
  try {
    const response = await fetchData(url);
    return response;
  } catch (error) {
    throw new Error('Error fetching products');
  }
};

export const fetchProductsForSections = async (
  filter: string,
  count: number
): Promise<{
  results: Product[];
}> => {
  try {
    const response: AxiosResponse = await axiosInstanceNoAuth.get(
      `/products/${filter}/`,
      {
        params: { count },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchContentTypes = async () => {
  try {
    const response = await axiosInstance.get('/content-type');
    return response.data;
  } catch (error) {
    console.error('Error fetching content types:', error);
    throw error;
  }
};

export const addCategory = async (category: {
  name: string;
  description: string;
  content_type_id: number; // Add content_type_id to the category type
}) => {
  try {
    const response = await axiosInstance.post('/categories/', category);
    return response.data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const fetchCategories = async (
  page: number,
  pageSize: number,
  contentTypeId?: number
) => {
  try {
    const params: any = { page, page_size: pageSize }; // Use 'page_size' to match Django's pagination parameter
    if (contentTypeId) {
      params.content_type_id = contentTypeId;
    }
    const response = await axiosInstance.get('/categories/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoryDetails = async (categoryId: number) => {
  try {
    const response = await axiosInstance.get(`/categories/${categoryId}/`);

    return response.data;
  } catch (error) {
    console.error('Error fetching category details:', error);
    return null;
  }
};

export const getCategoryNameById = async (id: string): Promise<string> => {
  try {
    const response = await axiosInstance.get(`/categories/${id}/`);
    return response.data.name;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

export const updateCategory = async (slug: string, category: any) => {
  try {
    const response = await axiosInstance.put(`/categories/${slug}/`, category);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (slug: string) => {
  try {
    const response = await axiosInstance.delete(`/categories/${slug}/`);
    if (response.status !== 200) {
      throw new Error('Category deletion failed');
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const fetchSubCategories = async (categoryId: number) => {
  const response = await axiosInstance.get(
    `/categories/${categoryId}/subcategories/`
  );
  return response.data;
};

// Define a function to check if the error is of type FetchError
export const isFetchError = (error: any): error is RTCError => {
  return typeof error.status === 'number' && typeof error.message === 'string';
};
