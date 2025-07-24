'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchNotifications, markNotificationAsRead } from '@/services/api';
import { Notification } from '@/types/types';
import ProfileImage from '@/components/UI/ProfileImage/ProfileImage';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  pageNumber: number;
  hasMore: boolean;
  isFetchingMore: boolean;
  showErrorModal: boolean;
  isClient: boolean;
  markingAsRead: { [key: number | string]: boolean }; // Fixed: Allow string keys for 'all'
}

const NOTIFICATIONS_PER_PAGE = 8;
const SCROLL_THRESHOLD = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    loading: true,
    error: null,
    pageNumber: 1,
    hasMore: true,
    isFetchingMore: false,
    showErrorModal: false,
    isClient: false,
    markingAsRead: {},
  });

  const notificationsEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure client-side rendering
  useEffect(() => {
    setState((prev) => ({ ...prev, isClient: true }));
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (state.isClient && !user) {
      router.push('/auth/login');
    }
  }, [user, router, state.isClient]);

  // Load notifications with pagination
  const loadNotifications = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!state.isClient || !user) return;

      setState((prev) => ({
        ...prev,
        [isLoadMore ? 'isFetchingMore' : 'loading']: true,
        error: null,
      }));

      try {
        const response = await fetchNotifications(
          pageNum,
          NOTIFICATIONS_PER_PAGE
        );
        const { count, results } = response;

        setState((prev) => {
          const newNotifications = isLoadMore
            ? [...prev.notifications, ...results]
            : results;

          const hasMoreNotifications = newNotifications.length < count;

          return {
            ...prev,
            notifications: newNotifications,
            hasMore: hasMoreNotifications,
            loading: false,
            isFetchingMore: false,
          };
        });
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to load notifications. Please try again.',
          showErrorModal: true,
          loading: false,
          isFetchingMore: false,
        }));
      }
    },
    [state.isClient, user]
  );

  // Initial load
  useEffect(() => {
    if (state.isClient && user) {
      loadNotifications(1);
    }
  }, [loadNotifications, state.isClient, user]);

  // Load more notifications when page number changes
  useEffect(() => {
    if (state.pageNumber > 1) {
      loadNotifications(state.pageNumber, true);
    }
  }, [state.pageNumber, loadNotifications]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (state.isFetchingMore || !state.hasMore) return;

    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
      setState((prev) => ({
        ...prev,
        pageNumber: prev.pageNumber + 1,
      }));
    }
  }, [state.isFetchingMore, state.hasMore]);

  // Throttled scroll event listener
  useEffect(() => {
    const throttledHandleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Time ago calculation
  const getTimeAgoString = useCallback((timestamp: string): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const timeDiff = now.getTime() - notificationTime.getTime();

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (weeks < 52) {
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  }, []);

  // Mark notification as read
  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      if (notification.is_read || state.markingAsRead[notification.id]) {
        return;
      }

      setState((prev) => ({
        ...prev,
        markingAsRead: {
          ...prev.markingAsRead,
          [notification.id]: true,
        },
      }));

      try {
        await markNotificationAsRead(notification.id);

        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          ),
          markingAsRead: {
            ...prev.markingAsRead,
            [notification.id]: false,
          },
        }));
      } catch (error) {
        console.error('Error marking notification as read:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to mark notification as read.',
          showErrorModal: true,
          markingAsRead: {
            ...prev.markingAsRead,
            [notification.id]: false,
          },
        }));
      }
    },
    [state.markingAsRead]
  );

  // Load more button handler
  const handleLoadMore = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pageNumber: prev.pageNumber + 1,
    }));
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    const unreadNotifications = state.notifications.filter((n) => !n.is_read);

    if (unreadNotifications.length === 0) return;

    setState((prev) => ({
      ...prev,
      markingAsRead: {
        ...prev.markingAsRead,
        all: true, // This now works with updated type
      },
    }));

    try {
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map((notification) =>
          markNotificationAsRead(notification.id)
        )
      );

      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
        markingAsRead: {
          ...prev.markingAsRead,
          all: false,
        },
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to mark all notifications as read.',
        showErrorModal: true,
        markingAsRead: {
          ...prev.markingAsRead,
          all: false,
        },
      }));
    }
  }, [state.notifications]);

  // Memoized notification item component
  const NotificationItem = useMemo(
    () =>
      React.memo<{ notification: Notification }>(({ notification }) => (
        <div
          className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
            notification.is_read
              ? 'bg-white opacity-75'
              : 'bg-blue-50 border-blue-200 shadow-sm'
          }`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <ProfileImage
                  alt="Notification profile"
                  src={
                    typeof notification.profile_image === 'string'
                      ? notification.profile_image
                      : ''
                  }
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  notification.is_read
                    ? 'text-gray-600'
                    : 'text-gray-900 font-medium'
                }`}
              >
                {notification.message}
              </p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {getTimeAgoString(notification.timestamp)}
                </span>

                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

                {state.markingAsRead[notification.id] && (
                  <InlineLoaderIcon className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      )),
    [handleNotificationClick, getTimeAgoString, state.markingAsRead]
  );

  // Loading skeleton for SSR compatibility
  if (!state.isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const unreadCount = state.notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${
                      unreadCount !== 1 ? 's' : ''
                    }`
                  : 'All caught up! No new notifications'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={state.markingAsRead.all}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.markingAsRead.all ? (
                    <>
                      <InlineLoaderIcon className="mr-2" />
                      Marking all...
                    </>
                  ) : (
                    'Mark all as read'
                  )}
                </button>
              )}

              <button
                onClick={() => router.push('/profile')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Profile
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {state.error && !state.showErrorModal && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{state.error}</p>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, error: null }))
                    }
                    className="text-red-800 hover:text-red-600 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          {state.notifications.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {state.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>

              {/* Load More Section */}
              {state.hasMore && (
                <div ref={notificationsEndRef} className="mt-8 text-center">
                  {state.isFetchingMore ? (
                    <div className="flex items-center justify-center space-x-2">
                      <InlineLoaderIcon />
                      <span className="text-gray-600">
                        Loading more notifications...
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleLoadMore}
                      className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      Show More Notifications
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-15 0V7c0-3.866 3.134-7 7-7s7 3.134 7 7v10z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600">
                When you receive notifications, they'll appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Modal */}
      <ModalAlert
        isOpen={state.showErrorModal}
        title="Error"
        message={state.error || 'An unexpected error occurred.'}
        onClose={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        onConfirm={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}
