import React, { useEffect, useState, useRef } from 'react';
import { fetchNotifications, markNotificationAsRead } from '../services/api'; // Assuming markNotificationAsRead is defined in your API service
import { Notification } from '../types/types';
import ProfileImage from '../components/UI/ProfileImage/ProfileImage';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // State to handle errors

  const notificationsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsFetchingMore(true);
      try {
        const response = await fetchNotifications(pageNumber, 8); // Fetch 8 notifications per page
        console.log('Response from fetchNotifications:', response); // Log response to inspect in console

        const { count, results } = response;
        const totalNotifications = count; // Total count of notifications

        if (results.length === 0) {
          setHasMore(false); // No more notifications to load
        } else {
          setNotifications((prevNotifications) => [
            ...prevNotifications,
            ...results,
          ]);

          // Check if all notifications are loaded
          const loadedNotifications = notifications.length + results.length;
          if (loadedNotifications >= totalNotifications) {
            setHasMore(false); // No more pages to load
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications. Please try again.'); // Update error state
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    };

    loadNotifications();
  }, [pageNumber]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isFetchingMore && hasMore && notificationsEndRef.current) {
        const { scrollTop, clientHeight, scrollHeight } =
          document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetchingMore, hasMore]);

  const getTimeAgoString = (timestamp: string): string => {
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
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markNotificationAsRead(notification.id); // Assuming markNotificationAsRead accepts the notification ID
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="p-6 bg-white">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h3>
      {error ? (
        <p>{error}</p> // Display error message if there's an error fetching notifications
      ) : isLoading ? (
        <p>Loading notifications...</p>
      ) : notifications.length > 0 ? (
        <>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification notification-${
                notification.is_read ? 'read' : 'unread'
              }`}
              onClick={() => handleNotificationClick(notification)} // Call handleNotificationClick on click
            >
              <ProfileImage
                alt="profile"
                src={
                  typeof notification.profile_image === 'string'
                    ? notification.profile_image
                    : ''
                }
              />
              <div className="">
                <p>{notification.message}</p>
                <span className="notification-timestamp">
                  {getTimeAgoString(notification.timestamp)}
                </span>
              </div>
            </div>
          ))}
          {hasMore && (
            <div ref={notificationsEndRef} className="see-more">
              {isFetchingMore ? (
                <p>Loading more...</p>
              ) : (
                <button
                  onClick={() => setPageNumber(pageNumber + 1)}
                  className="flex py-2.5 px-5 mx-auto my-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Show More Notifications
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <p>No notifications to display</p>
      )}
    </div>
  );
};

export default Notifications;
