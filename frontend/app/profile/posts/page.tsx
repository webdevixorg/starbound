'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContent } from '@/context/ContentContext';
import { changePostStatus, deletePost, fetchPosts } from '@/services/api';
import { Post } from '@/types/types';
import { CategoryName } from '@/helpers/fetching';
import LoadingSpinner from '@/components/Common/Loading';

const PostListPage: React.FC = () => {
  const pathname = usePathname();
  const { contentTypes, loading: contentLoading } = useContent();

  const [contentTypeId, setContentTypeId] = useState<number>(0);
  const [contentType, setContentType] = useState<string>('');
  const [nonTrashedPosts, setNonTrashedPosts] = useState<Post[]>([]);
  const [trashedPosts, setTrashedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nonDeletedCurrentPage, setNonDeletedCurrentPage] = useState<number>(1);
  const [deletedCurrentPage, setDeletedCurrentPage] = useState<number>(1);
  const [nontrashedTotalPages, setNontrashedTotalPages] = useState<number>(1);
  const [trashedTotalPages, setTrashedTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [status] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const matchedContentType = useMemo(() => {
    if (Array.isArray(contentTypes)) {
      return contentTypes.find(
        (contentType: any) => contentType.id === contentTypeId
      );
    }
    return null;
  }, [contentTypes, contentTypeId]);

  // Fetch content type on pathname change
  useEffect(() => {
    if (!isClient || contentLoading || !contentTypes) return;

    // Extract the base path from pathname
    const basePath = pathname.split('/')[2]; // For /profile/posts, get 'posts'

    // Remove trailing "s" if it exists
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
  }, [contentTypes, contentLoading, pathname, isClient]);

  // Load posts function
  const loadPosts = useCallback(
    async (page: number, isDeleted: boolean) => {
      if (!matchedContentType) return;

      try {
        setLoading(true);

        if (isDeleted) {
          const deletedResponse = await fetchPosts(
            page,
            pageSize,
            'Deleted',
            '',
            matchedContentType.model
          );
          setTrashedPosts(deletedResponse.results);
          setTrashedTotalPages(Math.ceil(deletedResponse.count / pageSize));
        } else {
          const nonDeletedResponse = await fetchPosts(
            page,
            pageSize,
            status,
            '',
            matchedContentType.model
          );
          setNonTrashedPosts(nonDeletedResponse.results);
          setNontrashedTotalPages(
            Math.ceil(nonDeletedResponse.count / pageSize)
          );
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Error fetching posts');
      } finally {
        setLoading(false);
      }
    },
    [matchedContentType, pageSize, status]
  );

  // Load posts when dependencies change
  useEffect(() => {
    if (!isClient || contentLoading || !matchedContentType || !contentTypeId)
      return;

    if (activeTab === 'trashed') {
      loadPosts(deletedCurrentPage, true);
    } else {
      loadPosts(nonDeletedCurrentPage, false);
    }
  }, [
    isClient,
    contentTypeId,
    activeTab,
    nonDeletedCurrentPage,
    deletedCurrentPage,
    loadPosts,
    contentLoading,
    matchedContentType,
  ]);

  const handleTrash = useCallback(
    async (slug: string) => {
      try {
        await changePostStatus(slug, contentType, 'Deleted');
        setNonTrashedPosts((prevPosts) =>
          prevPosts.filter((post) => post.slug !== slug)
        );
        // Refresh the trashed posts count
        setTrashedTotalPages((prev) => prev + 1);
      } catch (error) {
        console.error('Error trashing post:', error);
        setError('Error trashing post');
      }
    },
    [contentType]
  );

  const handleRestore = useCallback(
    async (slug: string) => {
      try {
        await changePostStatus(slug, contentType, 'Published');
        setTrashedPosts((prevPosts) =>
          prevPosts.filter((post) => post.slug !== slug)
        );
        // Refresh the non-trashed posts
        loadPosts(nonDeletedCurrentPage, false);
      } catch (error) {
        console.error('Error restoring post:', error);
        setError('Error restoring post');
      }
    },
    [contentType, loadPosts, nonDeletedCurrentPage]
  );

  const handleDelete = useCallback(
    async (slug: string) => {
      if (!confirm('Are you sure you want to permanently delete this post?')) {
        return;
      }

      try {
        await deletePost(slug, contentType);
        setTrashedPosts((prevPosts) =>
          prevPosts.filter((post) => post.slug !== slug)
        );
      } catch (error) {
        console.error('Error deleting post:', error);
        setError('Error deleting post');
      }
    },
    [contentType]
  );

  const handlePreviousPage = useCallback(() => {
    if (activeTab === 'trashed') {
      if (deletedCurrentPage > 1) {
        setDeletedCurrentPage((prev) => prev - 1);
      }
    } else {
      if (nonDeletedCurrentPage > 1) {
        setNonDeletedCurrentPage((prev) => prev - 1);
      }
    }
  }, [activeTab, deletedCurrentPage, nonDeletedCurrentPage]);

  const handleNextPage = useCallback(() => {
    if (activeTab === 'trashed') {
      if (deletedCurrentPage < trashedTotalPages) {
        setDeletedCurrentPage((prev) => prev + 1);
      }
    } else {
      if (nonDeletedCurrentPage < nontrashedTotalPages) {
        setNonDeletedCurrentPage((prev) => prev + 1);
      }
    }
  }, [
    activeTab,
    deletedCurrentPage,
    trashedTotalPages,
    nonDeletedCurrentPage,
    nontrashedTotalPages,
  ]);

  const posts = activeTab === 'active' ? nonTrashedPosts : trashedPosts;
  const currentPage =
    activeTab === 'active' ? nonDeletedCurrentPage : deletedCurrentPage;
  const totalPages =
    activeTab === 'active' ? nontrashedTotalPages : trashedTotalPages;

  // Show loading skeleton until client-side hydration
  if (!isClient) {
    return (
      <div className="p-6 bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex space-x-2 mb-4">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              loadPosts(currentPage, activeTab === 'trashed');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <Link
            href={`/profile/posts/create`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Post
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Posts
            </button>
            <button
              onClick={() => setActiveTab('trashed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trashed'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trash
            </button>
          </nav>
        </div>

        {/* Posts Table */}
        {posts && posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
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
              {activeTab === 'active' ? 'No posts yet' : 'No trashed posts'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'active'
                ? 'Create your first post to get started.'
                : 'Trashed posts will appear here.'}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/profile/posts/add-post?slug=${post.slug}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.categories.map((category, index) => (
                            <React.Fragment key={String(category)}>
                              <CategoryName categoryId={category} />
                              {index < post.categories.length - 1 && ', '}
                            </React.Fragment>
                          ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <Link
                            href={`/${contentType}s/${post.slug}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>

                          {activeTab === 'active' && (
                            <button
                              onClick={() => handleTrash(post.slug)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Trash
                            </button>
                          )}

                          {activeTab === 'trashed' && (
                            <>
                              <button
                                onClick={() => handleRestore(post.slug)}
                                className="text-green-600 hover:text-green-800"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => handleDelete(post.slug)}
                                className="text-red-600 hover:text-red-800"
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
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-700">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostListPage;
