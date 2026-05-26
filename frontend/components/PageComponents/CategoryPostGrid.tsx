'use client';
import React, { useEffect, useState } from 'react';
import { fetchPostsByCategory } from '@/services/api';
import { Post } from '@/types/types';
import BlogPostCardDefault from '../UI/Cards/BlogPostCardDefault';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Link from 'next/link';

const CategoryPostGrid: React.FC<{
  categoryId: number;
  count: number;
  title?: string;
}> = ({ categoryId, count, title = 'Post List' }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container mx-auto mb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl text-gray-900 tracking-tight">
            <span className="font-light">Explore</span>{' '}
            <span className="font-bold">{title}</span>
          </h2>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Stay updated with the latest trends and expert insights from the
            world of automotive technology.
          </p>
        </div>
        <Link
          href="/posts"
          className="text-red-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:text-black transition-colors group"
        >
          View All Stories
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Loading State */}
      {loadingPosts && (
        <div>
          {/* Header Skeleton */}
          <div className="border-b flex justify-between items-end mb-10 pb-6">
            <Skeleton height={32} width={200} />
            <Skeleton height={16} width={100} />
          </div>
          {/* Grid Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, index) => (
              <div key={index}>
                <Skeleton height={200} />
                <div className="p-4 space-y-2">
                  <Skeleton count={2} />
                  <Skeleton width="70%" />
                </div>
              </div>
            ))}
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

      {/* Posts Grid */}
      {!loadingPosts && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="transform transition-transform duration-300 hover:scale-105"
            >
              <BlogPostCardDefault post={post} index={index} />
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (if needed) */}
      {!loadingPosts && !error && posts.length > 0 && posts.length >= count && (
        <div className="text-center mt-8">
          <button
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            onClick={() => {
              // You can implement load more functionality here
              console.log('Load more posts');
            }}
          >
            View More Posts
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPostGrid;
