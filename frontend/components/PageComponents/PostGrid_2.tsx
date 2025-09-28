'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import SafeImage from '../UI/SafeImage';
import HtmlContent from '@/helpers/content';
import { getPublicImageUrl } from '@/helpers/media';

import { Post } from '@/types/types';
import { fetchPostsByCategory } from '@/services/api';

const LatestNews: React.FC<{
  categoryId: number;
  count: number;
  title?: string;
  viewAllLink?: string;
}> = ({ categoryId, count, title = 'Post List', viewAllLink = '/posts' }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure viewAllLink is never undefined
  const safeViewAllLink = viewAllLink || '/posts';

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        setError(null);
        const data = await fetchPostsByCategory(categoryId, count);
        setPosts(data.results || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [categoryId, count]);

  const popularPosts = posts
    .filter(
      (post) =>
        post.categories &&
        post.categories.length > 0 &&
        post.categories[0].slug === 'web-development'
    )
    .map((news) => news);

  return (
    <div className="flex flex-row flex-wrap  mb-10">
      <div className="flex-shrink max-w-full w-full lg:w-2/3 order-first lg:pr-8 lg:pb-8">
        <div className="border-b flex justify-between items-end mb-8 pb-6">
          <h2 className="text-gray-800 text-3xl">{title}</h2>
          {!loadingPosts && posts.length > 0 && (
            <Link
              className="text-blue-500 hover:text-blue-700 font-semibold capitalize"
              href={safeViewAllLink}
            >
              View All
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loadingPosts && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading posts...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loadingPosts && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg
                className="w-8 h-8 text-red-500"
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
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Unable to Load Posts
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingPosts && !error && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-300"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Posts Found
            </h3>
            <p className="text-gray-500 mb-4">
              There are currently no posts in this category.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}
        {/* Posts Content */}
        {!loadingPosts && !error && posts.length > 0 && (
          <div className="flex flex-row flex-wrap">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group cursor-pointer w-full px-3 mb-8"
              >
                <div
                  key={post.id}
                  className="flex flex-col sm:flex-row max-w-full w-full pb-3 pt-3 sm:pt-0 border-b-2 sm:border-b-0 border-dotted border-gray-100"
                >
                  <div
                    className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                    style={{ height: '250px', width: '300px' }} // Set a fixed height and width for consistency
                  >
                    <a
                      href={`posts/${post.slug}`}
                      className="h-full w-full block"
                    >
                      <SafeImage
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-110"
                        sizes="(max-width: 768px) 30vw, 33vw"
                        images={[
                          {
                            image_path: getPublicImageUrl(
                              'posts',
                              post.id,
                              post.images?.[0]?.image_path
                            ),
                          },
                        ]}
                        fill
                        width={400} // or your preferred width
                        height={300} // or your preferred height
                      />
                    </a>
                  </div>
                  <div className="flex-grow sm:pl-6 sm:mt-0">
                    <div className="text-gray-600 dark:text-gray-400 mb-4">
                      {post.categories && post.categories.length > 0 ? (
                        post.categories.map((category, index) => (
                          <span
                            key={`${post.id}-category-${category.id}-${index}`}
                            className="inline-block text-xs font-medium tracking-wider uppercase text-blue-600"
                          >
                            {category.name}
                          </span>
                        ))
                      ) : (
                        <span className="inline-block text-xs font-medium tracking-wider uppercase text-gray-600">
                          No categories available
                        </span>
                      )}
                    </div>
                    <Link href={`/posts/${post.slug}`}>
                      <h2 className="text-2xl font-bold capitalize text-gray-800 dark:text-white mb-3">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                      <HtmlContent htmlContent={post.description} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Sidebar - Only show when posts are loaded and available */}
      {!loadingPosts && !error && posts.length > 0 && (
        <div className="flex-shrink max-w-full w-full lg:w-1/3">
          <div className="w-full bg-white mb-6">
            <div className="p-4 bg-gray-100">
              <h2 className="text-lg font-bold">Most Popular</h2>
            </div>
            <ul className="post-number">
              {popularPosts.length > 0 ? (
                popularPosts.map((post, index) => (
                  <li
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <a
                      className="text-sm font-semibold px-6 py-3 flex flex-row items-center"
                      href={`posts/${post.slug}`}
                    >
                      {post.title}
                    </a>
                  </li>
                ))
              ) : (
                <li className="px-6 py-4 text-sm text-gray-500">
                  No popular posts available
                </li>
              )}
            </ul>
          </div>
          <div className="text-sm sticky">
            <div className="w-full text-center">
              <Link href="#" className="block">
                <NextImage
                  className="mx-auto w-full"
                  src="/images/ads/250.jpg"
                  alt="advertisement area"
                  width={250}
                  height={300}
                  style={{ width: '100%', height: 'auto' }}
                />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestNews;
