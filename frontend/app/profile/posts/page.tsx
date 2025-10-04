'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useContent } from '@/context/ContentContext';
import { changePostStatus, deletePost, fetchPostsAuth } from '@/services/api';
import { Post } from '@/types/types';
import LoadingSpinner from '@/components/Common/Loading';

const PostsListPage: React.FC = () => {
  const pathname = usePathname();
  const { contentTypes, loading: contentLoading } = useContent();

  const [contentTypeId, setContentTypeId] = useState<number>(0);
  const [contentType, setContentType] = useState<string>('');
  const [posts, setPosts] = useState<{ [key: string]: Post[] }>({
    draft: [],
    published: [],
    archived: [],
    deleted: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>({
    draft: 1,
    published: 1,
    archived: 1,
    deleted: 1,
  });
  const [totalPages, setTotalPages] = useState<{ [key: string]: number }>({
    draft: 1,
    published: 1,
    archived: 1,
    deleted: 1,
  });
  const [pageSize] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>('published');
  const [postCounts, setPostCounts] = useState<{ [key: string]: number }>({
    draft: 0,
    published: 0,
    archived: 0,
    deleted: 0,
  });

  const matchedContentType = useMemo(() => {
    if (Array.isArray(contentTypes)) {
      return contentTypes.find(
        (contentType: { id: number }) => contentType.id === contentTypeId
      );
    }
    return null;
  }, [contentTypes, contentTypeId]);

  // Determine content type from URL
  useEffect(() => {
    if (contentLoading || !contentTypes) return;

    const basePath = pathname ? pathname.split('/')[2] : '';
    let contentTypeName = basePath;
    if (basePath?.endsWith('s')) {
      contentTypeName = basePath.slice(0, -1);
    }

    const matchedContentType = Array.isArray(contentTypes)
      ? contentTypes.find(
          (contentType: { model: string }) =>
            contentType.model === contentTypeName
        )
      : undefined;

    if (matchedContentType) {
      setContentTypeId(matchedContentType.id);
      setContentType(matchedContentType.model);
    }
  }, [contentTypes, contentLoading, pathname]);

  const loadPostsByStatus = useCallback(
    async (status: string, page: number) => {
      try {
        setLoading(true);
        const response = await fetchPostsAuth<Post>(
          page,
          pageSize,
          status,
          matchedContentType.model
        );

        setPosts((prev) => ({
          ...prev,
          [status]: response.results,
        }));

        setTotalPages((prev) => ({
          ...prev,
          [status]: Math.ceil(response.count / pageSize),
        }));
      } catch (error) {
        console.error(`Error fetching ${status} posts:`, error);
        setError(`Error fetching ${status} posts`);
      } finally {
        setLoading(false);
      }
    },
    [matchedContentType?.model, pageSize]
  );

  const loadPostCounts = useCallback(async () => {
    if (!matchedContentType) return;

    try {
      const statuses = ['draft', 'published', 'archived', 'deleted'];
      const countPromises = statuses.map(async (status) => {
        const response = await fetchPostsAuth<Post>(
          1,
          1,
          status,
          matchedContentType.model
        );
        return { status, count: response.count };
      });

      const results = await Promise.all(countPromises);
      const counts = results.reduce(
        (acc, { status, count }) => {
          acc[status] = count;
          return acc;
        },
        {} as { [key: string]: number }
      );

      setPostCounts(counts);
    } catch (error) {
      console.error('Error fetching post counts:', error);
    }
  }, [matchedContentType]);

  useEffect(() => {
    if (!matchedContentType) return;
    loadPostsByStatus(activeTab, currentPages[activeTab]);
    loadPostCounts();
  }, [
    contentTypeId,
    activeTab,
    currentPages,
    matchedContentType,
    loadPostCounts,
    loadPostsByStatus,
  ]);

  const handleStatusChange = async (
    slug: string,
    newStatus: string,
    destinationTab: string
  ) => {
    try {
      await changePostStatus(slug, contentType, newStatus);

      // Update counts
      setPostCounts((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab] - 1,
        [destinationTab]: prev[destinationTab] + 1,
      }));

      // Reload current tab to update pagination
      const response = await fetchPostsAuth<Post>(
        currentPages[activeTab],
        pageSize,
        activeTab,
        contentType
      );

      setPosts((prev) => ({
        ...prev,
        [activeTab]: response.results,
      }));

      setTotalPages((prev) => ({
        ...prev,
        [activeTab]: Math.ceil(response.count / pageSize),
      }));
    } catch (error) {
      console.error(`Error changing post status to ${newStatus}:`, error);
      setError(`Error changing post status to ${newStatus}`);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deletePost(slug, contentType);

      // Update counts
      setPostCounts((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab] - 1,
      }));

      // Reload current tab
      loadPostsByStatus(activeTab, currentPages[activeTab]);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Error deleting post');
    }
  };

  const handlePageChange = (status: string, page: number) => {
    setCurrentPages((prev) => ({
      ...prev,
      [status]: page,
    }));
    loadPostsByStatus(status, page);
  };

  const renderPagination = (status: string) => {
    const currentPage = currentPages[status];
    const totalPageCount = totalPages[status];

    if (totalPageCount <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPageCount, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page button
    if (currentPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(status, 1)}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          First
        </button>
      );
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(status, currentPage - 1)}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(status, i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
            i === currentPage
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          } focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPageCount) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(status, currentPage + 1)}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      );
    }

    // Last page button
    if (currentPage < totalPageCount) {
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(status, totalPageCount)}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          Last
        </button>
      );
    }

    return (
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Showing page {currentPage} of {totalPageCount}
        </div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          {pages}
        </nav>
      </div>
    );
  };

  if (loading && contentLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  My Posts
                </h1>
              </div>
              <p className="text-lg text-gray-600 ml-11">
                Manage your blog posts and articles
              </p>
            </div>
            <Link
              href="/profile/posts/add-post"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Add Post
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide scroll-smooth">
              <button
                onClick={() => setActiveTab('published')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'published'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Published ({postCounts.published})
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'draft'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Draft ({postCounts.draft})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'archived'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Archived ({postCounts.archived})
              </button>
              <button
                onClick={() => setActiveTab('deleted')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'deleted'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Trash ({postCounts.deleted})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {posts[activeTab]?.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No {activeTab === 'deleted' ? 'trashed' : activeTab} posts
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'published'
                    ? 'Get started by creating a new post.'
                    : activeTab === 'deleted'
                      ? 'No posts in trash.'
                      : `No ${activeTab} posts.`}
                </p>
                {activeTab === 'published' && (
                  <div className="mt-6">
                    <Link
                      href="/profile/posts/add-post"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      + Add your first post
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto scrollbar-thin scroll-smooth">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Post
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {posts[activeTab]?.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-0">
                                <div className="text-sm font-medium text-gray-900">
                                  <Link
                                    href={`/profile/${contentType}s/add-${contentType}?slug=${post.slug}`}
                                    className="hover:text-blue-600"
                                  >
                                    {post.title}
                                  </Link>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {post.description
                                    ?.replace(/<[^>]*>/g, '')
                                    .substring(0, 50) || 'No description'}
                                  ...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {post.categories?.map((category) => (
                                <span
                                  key={
                                    typeof category === 'object'
                                      ? category.id
                                      : category
                                  }
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {category.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                post.status === 'Published'
                                  ? 'bg-green-100 text-green-800'
                                  : post.status === 'Draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link
                              href={`/${contentType}s/${post.slug}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link
                              href={`/profile/${contentType}s/add-${contentType}?slug=${post.slug}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                            {activeTab === 'published' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    post.slug,
                                    'deleted',
                                    'deleted'
                                  )
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Trash
                              </button>
                            )}
                            {activeTab === 'draft' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    post.slug,
                                    'deleted',
                                    'deleted'
                                  )
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Trash
                              </button>
                            )}
                            {activeTab === 'deleted' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(
                                      post.slug,
                                      'published',
                                      'published'
                                    )
                                  }
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Restore
                                </button>
                                <button
                                  onClick={() => handleDelete(post.slug)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tablet Table - Responsive */}
                <div className="hidden md:block lg:hidden overflow-x-auto scrollbar-thin scroll-smooth">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Post
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {posts[activeTab]?.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                  <Link
                                    href={`/profile/${contentType}s/add-${contentType}?slug=${post.slug}`}
                                    className="hover:text-blue-600"
                                  >
                                    {post.title}
                                  </Link>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(
                                    post.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                post.status === 'Published'
                                  ? 'bg-green-100 text-green-800'
                                  : post.status === 'Draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-1">
                              <Link
                                href={`/${contentType}s/${post.slug}`}
                                className="text-blue-600 hover:text-blue-900 text-xs"
                              >
                                View
                              </Link>
                              <Link
                                href={`/profile/${contentType}s/add-${contentType}?slug=${post.slug}`}
                                className="text-indigo-600 hover:text-indigo-900 text-xs"
                              >
                                Edit
                              </Link>
                              {activeTab === 'published' && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(
                                      post.slug,
                                      'deleted',
                                      'deleted'
                                    )
                                  }
                                  className="text-red-600 hover:text-red-900 text-xs text-left"
                                >
                                  Trash
                                </button>
                              )}
                              {activeTab === 'draft' && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(
                                      post.slug,
                                      'deleted',
                                      'deleted'
                                    )
                                  }
                                  className="text-red-600 hover:text-red-900 text-xs text-left"
                                >
                                  Trash
                                </button>
                              )}
                              {activeTab === 'deleted' && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        post.slug,
                                        'published',
                                        'published'
                                      )
                                    }
                                    className="text-green-600 hover:text-green-900 text-xs text-left"
                                  >
                                    Restore
                                  </button>
                                  <button
                                    onClick={() => handleDelete(post.slug)}
                                    className="text-red-600 hover:text-red-900 text-xs text-left"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {posts[activeTab]?.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            <Link
                              href={`/profile/${contentType}s/add-${contentType}?slug=${post.slug}`}
                              className="hover:text-blue-600"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                post.status === 'Published'
                                  ? 'bg-green-100 text-green-800'
                                  : post.status === 'Draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="flex flex-col space-y-1">
                            <Link
                              href={`/${contentType}s/${post.slug}`}
                              className="text-blue-600 hover:text-blue-900 text-xs"
                            >
                              View
                            </Link>
                            <Link
                              href={`/profile/${contentType}s/add-${contentType}?slug=${post.slug}`}
                              className="text-indigo-600 hover:text-indigo-900 text-xs"
                            >
                              Edit
                            </Link>
                            {activeTab === 'published' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    post.slug,
                                    'Deleted',
                                    'deleted'
                                  )
                                }
                                className="text-red-600 hover:text-red-900 text-xs text-left"
                              >
                                Trash
                              </button>
                            )}
                            {activeTab === 'draft' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    post.slug,
                                    'Deleted',
                                    'deleted'
                                  )
                                }
                                className="text-red-600 hover:text-red-900 text-xs text-left"
                              >
                                Trash
                              </button>
                            )}
                            {activeTab === 'deleted' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(
                                      post.slug,
                                      'Draft',
                                      'draft'
                                    )
                                  }
                                  className="text-green-600 hover:text-green-900 text-xs text-left"
                                >
                                  Restore
                                </button>
                                <button
                                  onClick={() => handleDelete(post.slug)}
                                  className="text-red-600 hover:text-red-900 text-xs text-left"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {renderPagination(activeTab)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsListPage;
