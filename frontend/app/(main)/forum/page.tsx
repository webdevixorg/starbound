'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/UI/SafeImage';
import { fetchCategories } from '@/services/api';
import { fetchForumThreads, fetchForumStats } from '@/services/forum';
import { getPublicImageUrl } from '@/helpers/media';

interface Thread {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: {
    profile: {
      image_path: string;
    };
    id: number;
    username: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    color?: string;
  };
  created_at: string;
  updated_at: string;
  views: number;
  replies_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  last_reply?: {
    author: {
      first_name: string;
      last_name: string;
      profile: {
        image_path: string;
      };
      id: number;
    };
    created_at: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface ForumStats {
  total_threads: number;
  total_replies: number;
  total_users: number;
  newest_member?: string;
}

const ForumPage: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load threads when filters change
  useEffect(() => {
    loadThreads(1, true);
  }, [selectedCategory, searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load categories and stats in parallel
      const [categoriesData, statsData] = await Promise.all([
        fetchCategories(1, 50),
        fetchForumStats().catch(() => null), // Don't fail if stats endpoint doesn't exist
      ]);

      // Handle categories response
      let categoryList = [];
      if (categoriesData.results && Array.isArray(categoriesData.results)) {
        categoryList = categoriesData.results;
      } else if (Array.isArray(categoriesData)) {
        categoryList = categoriesData;
      }

      setCategories(categoryList);
      if (statsData) setStats(statsData);

      // Load initial threads
      await loadThreads(1, true);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThreads = async (page: number = 1, reset: boolean = false) => {
    try {
      setThreadsLoading(true);

      const response = await fetchForumThreads({
        page,
        pageSize: 10,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });

      let threadList = [];
      if (response.results && Array.isArray(response.results)) {
        threadList = response.results;
      } else if (Array.isArray(response)) {
        threadList = response;
      }

      if (reset) {
        setThreads(threadList);
        setCurrentPage(1);
      } else {
        setThreads((prev) => [...prev, ...threadList]);
      }

      // Check if there are more pages
      setHasMore(threadList.length === 10);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading threads:', error);

      // Show fallback data on error
      if (reset) {
        setThreads([]);
      }
    } finally {
      setThreadsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search will trigger via useEffect
  };

  const handleLoadMore = () => {
    if (!threadsLoading && hasMore) {
      loadThreads(currentPage + 1, false);
    }
  };

  const getDefaultColor = (index: number) => {
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EF4444',
      '#06B6D4',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Community Forum
              </h1>
              <p className="text-gray-600">
                Connect with fellow automotive enthusiasts
              </p>
            </div>
            <Link
              href="/forum/create"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                       transition-all duration-200 ease-out font-medium text-sm shadow-sm hover:shadow-md active:scale-95"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Thread
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="p-6">
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search threads..."
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200/60 rounded-xl text-sm 
                             placeholder:text-gray-400 text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:bg-white/80
                             transition-all duration-200 ease-out"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200/60 rounded-xl text-sm text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:bg-white/80
                             transition-all duration-200 ease-out"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl 
                             transition-all duration-200 ease-out font-medium text-sm"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Thread List */}
          <div className="space-y-4">
            {threads.length === 0 && !threadsLoading ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-8 text-center">
                <div className="text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No threads found
                  </h3>
                  <p className="text-gray-500">
                    Be the first to start a discussion!
                  </p>
                </div>
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Thread Header */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <SafeImage
                          alt={thread.author.username || 'Author Avatar'}
                          className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                          images={[
                            {
                              image_path: getPublicImageUrl(
                                'profiles',
                                thread.author.id,
                                thread.author.profile.image_path
                              ),
                            },
                          ]}
                          width={400}
                          height={300}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta badges */}
                        <div className="flex items-center gap-2 mb-2">
                          {thread.is_pinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                              </svg>
                              Pinned
                            </span>
                          )}
                          {thread.is_solved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Solved
                            </span>
                          )}
                          {thread.is_locked && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Locked
                            </span>
                          )}
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{
                              backgroundColor:
                                thread.category?.color ||
                                getDefaultColor(thread.category?.id || 0),
                            }}
                          >
                            {thread.category?.name}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          <Link
                            href={`/forum/${thread.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {thread.title}
                          </Link>
                        </h3>

                        {/* Meta info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              by <strong>{thread.author.username}</strong>
                            </span>
                            <span>
                              {new Date(thread.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              {thread.views}
                            </div>
                            <div className="flex items-center gap-1">
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
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {thread.replies_count}
                            </div>
                          </div>
                        </div>

                        {/* Last reply info */}
                        {thread.last_reply && (
                          <div className="mt-3 pt-3 border-t border-gray-100/70">
                            <div className="text-xs text-gray-500">
                              Last reply by{' '}
                              <strong>
                                {thread.last_reply.author.first_name}
                              </strong>{' '}
                              •{' '}
                              {new Date(
                                thread.last_reply.created_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {threadsLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && !threadsLoading && threads.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg 
                         transition-all duration-200 ease-out font-medium text-sm"
              >
                Load More Threads
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-1/3 space-y-6">
          {/* Forum Stats */}
          {stats && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-blue-100/30 border-b border-blue-200/50">
                <h3 className="text-lg font-semibold text-blue-900">
                  Forum Statistics
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Threads</span>
                  <span className="font-semibold text-gray-900">
                    {stats.total_threads?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Replies</span>
                  <span className="font-semibold text-gray-900">
                    {stats.total_replies?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Members</span>
                  <span className="font-semibold text-gray-900">
                    {stats.total_users?.toLocaleString() || 0}
                  </span>
                </div>
                {stats.newest_member && (
                  <div className="pt-2 border-t border-gray-100/70">
                    <div className="text-sm text-gray-600">
                      Newest member: <strong>{stats.newest_member}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Categories
                </h3>
              </div>
              <div className="divide-y divide-gray-100/70">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className="w-full block p-4 hover:bg-gray-50/60 transition-colors duration-200 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            category.color || getDefaultColor(index),
                        }}
                      />
                      <h4 className="font-medium text-gray-900">
                        {category.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Links
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/forum?sort=recent"
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50/60 rounded-lg transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Recent Posts</span>
              </Link>
              <Link
                href="/forum?filter=unanswered"
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50/60 rounded-lg transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Unanswered</span>
              </Link>
              <Link
                href="/forum?sort=popular"
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50/60 rounded-lg transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span className="text-sm font-medium">Popular</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ForumPage;
