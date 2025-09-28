// Enhanced AxiosInstance.ts
import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Logout function
const performLogout = () => {
  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');

  // Clear any user data from localStorage
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');

  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

// Request interceptor - Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle authentication errors
    if (error.response?.status === 401) {
      // If we're already refreshing tokens, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Check if this is a token refresh request that failed
      if (originalRequest.url?.includes('token/refresh/')) {
        console.log('Refresh token expired, logging out...');
        performLogout();
        return Promise.reject(error);
      }

      // Don't retry certain requests (like login)
      if (
        originalRequest.url?.includes('auth/login/') ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        localStorage.getItem('refresh_token') ||
        sessionStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          console.log('Attempting to refresh token...');

          // Attempt to refresh token
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;

          // Update stored token
          localStorage.setItem('access_token', access);

          // Update default headers
          axiosInstance.defaults.headers.common['Authorization'] =
            `Bearer ${access}`;

          // Process queued requests
          processQueue(null, access);

          console.log('Token refreshed successfully');

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError: any) {
          console.log('Token refresh failed:', refreshError.response?.data);

          // Refresh failed - logout user
          processQueue(refreshError, null);
          performLogout();

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available - logout
        console.log('No refresh token available, logging out...');
        performLogout();
        return Promise.reject(error);
      }
    }

    // Handle other authentication/authorization errors
    if (error.response?.status === 403) {
      console.log('Access forbidden - insufficient permissions');

      // Check if it's a token-related permission error
      const data =
        (error.response?.data as { error?: string; detail?: string }) || {};
      const errorMessage = data.error || data.detail || '';
      if (
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('authentication') ||
        errorMessage.toLowerCase().includes('credential')
      ) {
        performLogout();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
