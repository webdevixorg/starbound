import React, { useEffect, useState, useRef } from 'react';
import { fetchUpdates, markUpdateAsRead } from '../services/api';
import { Update } from '../types/types';
import ProfileImage from '../components/UI/ProfileImage/ProfileImage';

const Updates: React.FC = () => {
  const [Updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // State to handle errors

  const UpdatesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUpdates = async () => {
      setIsFetchingMore(true);
      try {
        const response = await fetchUpdates(pageNumber, 8);
        console.log('Response from fetchUpdates:', response);

        const { count, results } = response;
        const totalUpdates = count;

        if (results.length === 0) {
          setHasMore(false); // No more travel updates to load
        } else {
          setUpdates((prevUpdates) => [...prevUpdates, ...results]);

          // Check if all travel updates are loaded
          const loadedUpdates = Updates.length + results.length;
          if (loadedUpdates >= totalUpdates) {
            setHasMore(false); // No more pages to load
          }
        }
      } catch (error) {
        console.error('Error fetching travel updates:', error);
        setError('Failed to load updates. Please try again.'); // Update error state
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    };

    loadUpdates();
  }, [pageNumber]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isFetchingMore && hasMore && UpdatesEndRef.current) {
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
    const UpdateTime = new Date(timestamp);
    const timeDiff = now.getTime() - UpdateTime.getTime();

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

  const handleUpdateClick = async (Update: Update) => {
    try {
      await markUpdateAsRead(Update.id);
      setUpdates((prevUpdates) =>
        prevUpdates.map((tu) =>
          tu.id === Update.id ? { ...tu, is_read: true } : tu
        )
      );
    } catch (error) {
      console.error('Error marking travel update as read:', error);
    }
  };

  return (
    <div className="p-6 bg-white">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Updates</h3>
      {error ? (
        <p>{error}</p> // Display error message if there's an error fetching travel updates
      ) : isLoading ? (
        <p>Loading travel updates...</p>
      ) : Updates.length > 0 ? (
        <>
          {Updates.map((Update) => (
            <div
              key={Update.id}
              className={`notification notification-${
                Update.is_read ? 'read' : 'unread'
              }`}
              onClick={() => handleUpdateClick(Update)} // Call handleUpdateClick on click
            >
              <ProfileImage
                alt="profile"
                src={
                  typeof Update.profile_image === 'string'
                    ? Update.profile_image
                    : ''
                }
              />
              <div className="">
                <p>{Update.message}</p>
                <span className="notification-timestamp">
                  {getTimeAgoString(Update.timestamp)}
                </span>
              </div>
            </div>
          ))}
          {hasMore && (
            <div ref={UpdatesEndRef} className="see-more">
              {isFetchingMore ? (
                <p>Loading more...</p>
              ) : (
                <button
                  onClick={() => setPageNumber(pageNumber + 1)}
                  className="flex py-2.5 px-5 mx-auto my-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Show More Travel Updates
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <p>No updates to display</p>
      )}
    </div>
  );
};

export default Updates;
