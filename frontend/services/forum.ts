/**
 * Forum Service Module
 * Handles all forum-related API interactions including threads, replies, and statistics.
 * Uses both authenticated and non-authenticated axios instances based on the endpoint requirements.
 */

import { ForumPostsResponse } from '@/types/types';
import axiosInstance from './AxiosInstance';
import axiosInstanceNoAuth from './AxiosInstanceNoAuth';

/**
 * Creates a new forum thread
 * @param threadData - Object containing thread information
 * @param threadData.title - The title of the thread
 * @param threadData.content - The content/body of the thread
 * @param threadData.category - The category ID for the thread
 * @returns The created thread data
 * @throws Error if creation fails or user is not authenticated
 */
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

/**
 * Fetches forum threads with optional filtering and pagination
 * @param params - Optional parameters for filtering and pagination
 * @param params.page - Page number for pagination (default: 1)
 * @param params.pageSize - Number of threads per page (default: 20)
 * @param params.category - Category filter (optional)
 * @param params.search - Search query string (optional)
 * @param params.author - Filter by author ID (optional)
 * @param params.myThreads - Filter to show only current user's threads (optional)
 * @returns Paginated list of forum threads
 * @throws Error if the fetch operation fails
 */
export const fetchForumThreads = async (params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  author?: number;
  myThreads?: boolean;
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

    if (params?.author) {
      queryParams.author = params.author;
    }

    if (params?.myThreads) {
      queryParams.my_threads = 'true';
    }

    // Use authenticated instance if fetching user's own threads
    const axiosClient = params?.myThreads ? axiosInstance : axiosInstanceNoAuth;

    const response = await axiosClient.get('/forum/', {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    throw error;
  }
};

/**
 * Fetches threads created by the currently authenticated user
 * @param params - Optional parameters for filtering and pagination
 * @param params.page - Page number for pagination (default: 1)
 * @param params.pageSize - Number of threads per page (default: 20)
 * @param params.category - Category filter (optional)
 * @param params.search - Search query string (optional)
 * @returns Paginated list of user's forum threads
 * @throws Error if fetch fails or user is not authenticated
 */
export const fetchMyThreads = async (params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}) => {
  try {
    const queryParams: any = {
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
      my_threads: 'true', // Always filter by current user
    };

    if (params?.category && params.category !== 'all') {
      queryParams.category = params.category;
    }

    if (params?.search) {
      queryParams.search = params.search;
    }

    const response = await axiosInstance.get('/forum/', {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my threads:', error);
    throw error;
  }
};

/**
 * Fetches a specific forum thread by its slug
 * @param slug - The unique slug identifier of the thread
 * @returns The thread data including title, content, and metadata
 * @throws Error if thread is not found or fetch fails
 */
export const fetchThreadBySlug = async (slug: string) => {
  try {
    const response = await axiosInstanceNoAuth.get(`/forum/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching thread:', error);
    throw error;
  }
};

/**
 * Fetches replies for a specific forum thread
 * @param slug - The unique slug identifier of the parent thread
 * @param page - Page number for pagination (default: 1)
 * @returns Paginated list of replies for the thread
 * @throws Error if replies cannot be fetched
 */
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

/**
 * Creates a new reply to a forum thread
 * @param slug - The unique slug identifier of the parent thread
 * @param content - The content of the reply
 * @returns The created reply data
 * @throws Error if creation fails, user is not authenticated, or content is invalid
 */
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

/**
 * Fetches forum statistics
 * @returns Forum statistics including total threads, replies, and active users
 * @throws Error if stats cannot be fetched
 */
export const fetchForumStats = async () => {
  try {
    const response = await axiosInstanceNoAuth.get('/forum/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    throw error;
  }
};

/**
 * Fetches forum posts for a specific user
 * @param userId - Optional user ID (defaults to current user if not provided)
 * @param limit - Maximum number of posts to fetch (default: 5)
 * @returns Forum posts response containing user's posts and metadata
 * @throws Error if posts cannot be fetched or response is invalid
 */
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
