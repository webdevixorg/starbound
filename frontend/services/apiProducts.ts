import axios, { AxiosResponse } from 'axios';
import axiosInstance from './AxiosInstance';
import axiosInstanceNoAuth from './AxiosInstanceNoAuth';
import { Product, ProductData, Category } from '@/types/types'; // Adjust the import path as necessary
import { fetchData } from './api';

// Helper function to convert ProductData to FormData
const convertToFormData = (data: ProductData): FormData => {
  const formData = new FormData();
  const appendToFormData = (key: string, value: any) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item.toString()));
    } else {
      formData.append(key, value.toString());
    }
  };

  (Object.keys(data) as (keyof ProductData)[]).forEach((key) => {
    appendToFormData(key, data[key]);
  });

  return formData;
};

export const fetchProducts = async (
  orderBy: string,
  page: number,
  limit: number,
  filters: {
    type: string;
    id?: number;
    min?: number;
    max?: number;
    name?: string;
  }[]
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
  let url = `/products/f/?orderBy=${encodeURIComponent(
    orderBy
  )}&page=${page}&limit=${limit}`;

  filters.forEach((filter) => {
    if (filter.type === 'price') {
      if (filter.min !== undefined) {
        url += `&minPrice=${encodeURIComponent(filter.min)}`;
      }
      if (filter.max !== undefined) {
        url += `&maxPrice=${encodeURIComponent(filter.max)}`;
      }
    } else if (filter.type === 'query' && filter.name) {
      url += `&query=${encodeURIComponent(filter.name)}`;
    } else {
      url += `&${encodeURIComponent(filter.type)}=${encodeURIComponent(
        filter.id || ''
      )}`;
    }
  });

  try {
    const response = await fetchData(url);
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Error fetching products');
  }
};

export const fetchProductsAuth = async (
  page: number = 1,
  pageSize: number = 10,
  contentType: number,
  filter: string = ''
): Promise<{
  page_size: number;
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}> => {
  try {
    const response = await axiosInstance.get(`/${contentType}/p/${filter}`, {
      params: { page, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    throw error;
  }
};

export const fetchTrashedProducts = async (
  page: number = 1,
  pageSize: number = 10,
  isDeleted: boolean,
  filter: string = ''
): Promise<{
  page_size: number;
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}> => {
  try {
    const response = await axiosInstance.get(`/products/p/${filter}`, {
      params: { is_deleted: isDeleted, page, page_size: pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const trashProduct = async (slug: string) => {
  try {
    const response = await axiosInstance.patch(
      `/posts/p/${slug}/soft-delete/`,
      {
        is_deleted: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Post deletion failed');
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const fetchProductsForSections = async (
  filter: string,
  count: number
): Promise<{
  results: Product[];
}> => {
  try {
    const response = await axiosInstanceNoAuth.get(`/products/f/${filter}/`, {
      params: { count },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const response = await axiosInstanceNoAuth.get(`/products/f/${slug}`);
    const postData = response.data;

    // Fetch category details for each category ID
    const categoryPromises = postData.categories.map(
      async (category: number) => {
        const categoryResponse: AxiosResponse = await axiosInstanceNoAuth.get(
          `/categories/${category}`
        );
        return categoryResponse.data;
      }
    );

    const categories: Category[] = await Promise.all(categoryPromises);

    // Replace response.data.categories with the fetched category details
    const result = {
      ...postData,
      categories: categories,
    };

    return result;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const fetchProductBySlugAuth = async (
  slug: string
): Promise<Product> => {
  try {
    const response = await axiosInstance.get(`/products/p/${slug}`);
    const postData = response.data;

    // Fetch category details for each category ID
    const categoryPromises = postData.categories.map(
      async (category: number) => {
        const categoryResponse: AxiosResponse = await axiosInstanceNoAuth.get(
          `/categories/${category}`
        );
        return categoryResponse.data;
      }
    );

    const categories: Category[] = await Promise.all(categoryPromises);

    // Replace response.data.categories with the fetched category details
    const result = {
      ...postData,
      categories: categories,
    };

    return result;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const fetchProductById = async (productId: number) => {
  try {
    const response = await axiosInstanceNoAuth.get(
      `/products/id/${productId}/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (data: ProductData): Promise<Product> => {
  try {
    const formData = convertToFormData(data);
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
    console.error('Error creating product:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Failed to create product'
      );
    }
    throw error;
  }
};

export const updateProduct = async (
  slug: string,
  data: ProductData
): Promise<Product> => {
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

    (Object.keys(data) as (keyof ProductData)[]).forEach((key) => {
      appendToFormData(key, data[key]);
    });

    // Send the formData to the backend
    const response = await axiosInstance.put(
      `/${data.contentType}s/p/${slug}/`,
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

export const fetchLocations = async () => {
  return fetchData('/locations/');
};

export const fetchSubLocations = async (locationId: number | string) => {
  return fetchData(`/locations/${locationId}/sublocations/`);
};

// Helper function to handle data fetching and error handling

export const fetchFeaturedAds = async () => {
  return fetchData('/products/f/featured/');
};

export const fetchRelatedProducts = async (slug: string) => {
  return fetchData(`/products/related-products/${slug}/`);
};

export const createOrder = async (transactionData: any): Promise<any> => {
  try {
    const response = await axiosInstanceNoAuth.post(
      '/product-orders/',
      transactionData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data;
    if (response.status === 201) {
      return result;
    } else {
      throw new Error('Failed to place order.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw new Error('An error occurred while placing the order.');
  }
};

export const fetchOrders = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/product-orders/');
    return response.data;
  } catch (error) {
    console.error('Error fetching Orders:', error);
    throw error;
  }
};

export const fetchOrder = async (orderId: number) => {
  try {
    const response = await axiosInstanceNoAuth.get(
      `/product-orders/${orderId}/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const createReview = async (reviewData: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      '/reviews/', // Replace with your correct endpoint
      reviewData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data;
    if (response.status === 201) {
      return result;
    } else {
      throw new Error('Failed to create review.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw new Error('An error occurred while submitting the review.');
  }
};

// Fetch reviews based on current user's permissions (admin or self)
export const fetchAllReviews = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/reviews/manage');
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Fetch reviews by product ID
export const fetchReviewsByProductID = async (productId: number) => {
  try {
    const response = await axiosInstance.get('/reviews/by-product', {
      params: { product_id: productId },
    });
    return response.data; // array of reviews
  } catch (error) {
    console.error('Error fetching reviews by product ID:', error);
    throw error;
  }
};

// Post-based request to fetch reviews by userId
export const fetchReviewsByUserId = async (userId: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/reviews/by-user/`, {
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews for user:', error);
    throw error;
  }
};

export const fetchReview = async (reviewId: number): Promise<any> => {
  try {
    const response = await axiosInstanceNoAuth.get(
      `/reviews/${reviewId}/` // Replace with your correct endpoint
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

export async function updateReviewApproval(
  id: number,
  data: { status: number }
): Promise<void> {
  try {
    await axiosInstance.patch(`/reviews/${id}/`, data);
  } catch (error) {
    throw new Error('Failed to update review status');
  }
}

export const deleteReview = async (reviewId: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error('Failed to delete review');
  }
};

export const addAdminResponse = async (
  reviewId: number,
  responseText: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `/reviews/${reviewId}/response/`,
      {
        response: responseText,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding admin response:', error);
    throw new Error('Failed to add admin response');
  }
};

// Enhanced fetchAllReviews with pagination and filtering
export const fetchAllReviewsWithFilters = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  status?: number | null;
  rating?: number | null;
  ordering?: string;
}): Promise<any> => {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size)
      searchParams.append('page_size', params.page_size.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status !== undefined && params?.status !== null) {
      searchParams.append('status', params.status.toString());
    }
    if (params?.rating) searchParams.append('rating', params.rating.toString());
    if (params?.ordering) searchParams.append('ordering', params.ordering);

    const response = await axiosInstance.get(`/reviews/manage?${searchParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews with filters:', error);
    throw error;
  }
};

// Bulk operations for reviews
export const bulkUpdateReviews = async (
  reviewIds: number[],
  action: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/reviews/bulk-action/', {
      review_ids: reviewIds,
      action: action,
    });
    return response.data;
  } catch (error) {
    console.error('Error performing bulk action:', error);
    throw new Error(`Failed to ${action} reviews`);
  }
};

// Update existing updateReviewApproval to return proper response
export async function updateReviewApprovalEnhanced(
  id: number,
  status: number
): Promise<any> {
  try {
    const response = await axiosInstance.patch(`/reviews/${id}/`, { status });
    return {
      id,
      status,
      message: `Review ${status === 1 ? 'approved' : status === 0 ? 'set to pending' : 'moved to trash'} successfully.`,
      data: response.data,
    };
  } catch (error) {
    console.error('Failed to update review status:', error);
    throw new Error('Failed to update review status');
  }
}
