import { ForumPostsResponse } from '@/types/types';
import axiosInstance from './AxiosInstance';
import axiosInstanceNoAuth from './AxiosInstanceNoAuth';

export const createThread = async (threadData: {
  title: string;
  content: string;
  category: number;
}) => {
  try {
    const response = await axiosInstance.post('/forum/', threadData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating thread:', error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Please log in to create a thread');
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    // Handle validation errors
    if (error.response?.data && typeof error.response.data === 'object') {
      const firstError = Object.values(error.response.data)[0];
      if (Array.isArray(firstError)) {
        throw new Error(firstError[0]);
      }
    }

    throw new Error('Failed to create thread. Please try again.');
  }
};

// Forum API Functions
export const fetchForumThreads = async (params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}) => {
  try {
    const queryParams: any = {
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
    };

    if (params?.category && params.category !== 'all') {
      queryParams.category = params.category;
    }

    if (params?.search) {
      queryParams.search = params.search;
    }

    const response = await axiosInstanceNoAuth.get('/forum/', {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    throw error;
  }
};

export const fetchThreadBySlug = async (slug: string) => {
  try {
    const response = await axiosInstanceNoAuth.get(`/forum/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching thread:', error);
    throw error;
  }
};

export const fetchThreadReplies = async (slug: string, page: number = 1) => {
  try {
    const response = await axiosInstanceNoAuth.get(`/forum/${slug}/replies/`, {
      params: { page, page_size: 20 },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching thread replies:', error);
    throw error;
  }
};

export const createThreadReply = async (slug: string, content: string) => {
  try {
    const response = await axiosInstance.post(`/forum/${slug}/replies/`, {
      content: content.trim(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating reply:', error);

    if (error.response?.status === 401) {
      throw new Error('Please log in to post a reply');
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Failed to post reply. Please try again.');
  }
};

export const fetchForumStats = async () => {
  try {
    const response = await axiosInstanceNoAuth.get('/forum/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    throw error;
  }
};

export const fetchUserForumPosts = async (
  userId?: number,
  limit: number = 5
): Promise<ForumPostsResponse> => {
  try {
    const response = await axiosInstance.get('/forum/');

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    throw error;
  }
};
