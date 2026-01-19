'use client';

import React, { useEffect, useState } from 'react';
import SafeImage from '../UI/SafeImage';
import { fetchPosts } from '@/services/api';
import { Post } from '@/types/types';
import { getOptimizedImageUrl } from '@/services/images';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HeroBigGrid: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        setError(null);
        const data = await fetchPosts(1, count, filter, 'post');
        setPosts(data.results.slice(0, count));
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [filter, count]);

  // Loading State
  if (loadingPosts) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:gap-5 mb-10">
        {/* Left Big Skeleton */}
        <div className="relative block overflow-hidden rounded-lg">
          <Skeleton height={500} />
        </div>

        {/* Right Grid of Smaller Skeletons */}
        <div className="relative h-[500px] grid grid-cols-2 gap-3 lg:gap-4">
          {[...Array(count - 1)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-lg"
            >
              <Skeleton height="100%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error && !loadingPosts) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.118 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-red-800 mb-2">
          Unable to Load Featured Posts
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty State
  if (!loadingPosts && !error && posts.length === 0) {
    return (
      <div className="text-center py-24 mb-10">
        <div className="flex items-center justify-center mb-6">
          <svg
            className="w-16 h-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-medium text-gray-900 mb-3">
          No Featured Posts Available
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          There are currently no posts to feature on the homepage. Check back
          later for new content.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const renderCategories = (post: Post) =>
    post.categories && post.categories.length > 0 ? (
      post.categories.map((category, index) => (
        <span
          key={`${post.id}-category-${category.id}-${index}`}
          className="inline-block text-xs font-medium tracking-wider uppercase text-white mr-2"
        >
          {category.name}
        </span>
      ))
    ) : (
      <span className="text-xs font-medium tracking-wider uppercase text-gray-300">
        No categories
      </span>
    );

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:gap-5 mb-10">
      {/* Left Big Image */}
      <a
        href={`posts/${posts[0].slug}`}
        className="group relative block overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
      >
        <SafeImage
          alt={posts[0].title}
          className="w-full h-full object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, 50vw"
          fill
          images={[
            {
              image_path: getOptimizedImageUrl(
                posts[0].images?.[0]?.image_path || '',
                'full',
                'post',
                posts[0].id
              ),
            },
          ]}
        />
        <div className="absolute bottom-0 w-full px-5 pt-8 pb-5 bg-gradient-cover">
          <h2 className="text-xl font-bold capitalize text-white mb-3">
            {posts[0].title}
          </h2>
          <p
            className="text-gray-100 hidden sm:block"
            dangerouslySetInnerHTML={{ __html: posts[0].description }}
          ></p>
          <div className="pt-3">
            <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
            {renderCategories(posts[0])}
          </div>
        </div>
      </a>

      {/* Right Grid of Smaller Posts */}
      <div className="relative h-[500px] grid grid-cols-2 gap-3 lg:gap-4">
        {posts.slice(1, count).map((post) => (
          <a
            key={post.id}
            href={`posts/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <div className="relative h-full w-full">
              <SafeImage
                alt={post.title}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                fill
                images={[
                  {
                    image_path: getOptimizedImageUrl(
                      post.images?.[0]?.image_path || '',
                      'medium',
                      'post',
                      post.id
                    ),
                  },
                ]}
              />
              <div className="absolute bottom-0 w-full px-4 pt-6 pb-4 bg-gradient-cover">
                <h2 className="text-sm font-semibold capitalize text-white mb-1 leading-tight">
                  {post.title}
                </h2>
                <div className="pt-1">
                  <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
                  {renderCategories(post)}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default HeroBigGrid;
