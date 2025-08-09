'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useContent } from '@/context/ContentContext';
import { changePostStatus, deletePost, fetchPosts } from '@/services/api';
import { Post } from '@/types/types';
import { CategoryName } from '@/helpers/fetching';
import LoadingSpinner from '@/components/Common/Loading';
import SafeImage from '@/components/UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';

const ProductsListPage: React.FC = () => {
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
    if (contentLoading || !contentTypes) return;

    // Extract the base path from pathname
    const pathSegments = (pathname ?? '').split('/').filter(Boolean);
    const basePath = pathSegments[pathSegments.length - 1]; // Get last segment (products)

    // Remove trailing "s" if it exists
    let contentTypeName = basePath;
    if (basePath.endsWith('s')) {
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

  useEffect(() => {
    if (contentLoading || !matchedContentType) return;

    const loadPosts = async (page: number, isDeleted: boolean) => {
      try {
        setLoading(true);

        if (isDeleted) {
          const status = 'Deleted';
          const deletedResponse = await fetchPosts(
            page,
            pageSize,
            status,
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
    };

    if (contentTypeId) {
      if (activeTab === 'trashed') {
        loadPosts(deletedCurrentPage, true);
      } else {
        loadPosts(nonDeletedCurrentPage, false);
      }
    }
  }, [
    contentTypeId,
    activeTab,
    nonDeletedCurrentPage,
    deletedCurrentPage,
    matchedContentType,
    pageSize,
    status,
  ]);

  const handleTrash = async (slug: string) => {
    try {
      await changePostStatus(slug, contentType, 'Deleted');
      setNonTrashedPosts((prevPosts) =>
        prevPosts.filter((post) => post.slug !== slug)
      );
      setNontrashedTotalPages(
        Math.ceil((nonTrashedPosts.length - 1) / pageSize)
      );
    } catch (error) {
      console.error('Error trashing post:', error);
      setError('Error trashing post');
    }
  };

  const handleRestore = async (slug: string) => {
    try {
      await changePostStatus(slug, contentType, 'Published');
      setTrashedPosts((prevPosts) =>
        prevPosts.filter((post) => post.slug !== slug)
      );
    } catch (error) {
      console.error('Error restoring post:', error);
      setError('Error restoring post');
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deletePost(slug, contentType);
      setTrashedPosts((prevPosts) =>
        prevPosts.filter((post) => post.slug !== slug)
      );
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Error deleting post');
    }
  };

  const handlePreviousPage = () => {
    if (activeTab === 'trashed') {
      if (deletedCurrentPage > 1) {
        setDeletedCurrentPage(deletedCurrentPage - 1);
      }
    } else {
      if (nonDeletedCurrentPage > 1) {
        setNonDeletedCurrentPage(nonDeletedCurrentPage - 1);
      }
    }
  };

  const handleNextPage = () => {
    if (activeTab === 'trashed') {
      if (deletedCurrentPage < trashedTotalPages) {
        setDeletedCurrentPage(deletedCurrentPage + 1);
      }
    } else {
      if (nonDeletedCurrentPage < nontrashedTotalPages) {
        setNonDeletedCurrentPage(nonDeletedCurrentPage + 1);
      }
    }
  };

  const posts = activeTab === 'active' ? nonTrashedPosts : trashedPosts;
  const currentPage =
    activeTab === 'active' ? nonDeletedCurrentPage : deletedCurrentPage;
  const totalPages =
    activeTab === 'active' ? nontrashedTotalPages : trashedTotalPages;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your product listings and inventory
              </p>
            </div>
            <Link
              href="/profile/products/add-product"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Products ({nonTrashedPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('trashed')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'trashed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Trash ({trashedPosts.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {posts && posts.length === 0 ? (
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8H7"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No {activeTab === 'active' ? 'active' : 'trashed'} products
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'active'
                    ? 'Get started by creating a new product.'
                    : 'No products in trash.'}
                </p>
                {activeTab === 'active' && (
                  <div className="mt-6">
                    <Link
                      href="/profile/products/add-product"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      + Add your first product
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
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
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <SafeImage
                                  alt={post.title}
                                  className="inline-block mb-2 w-full mx-auto" // Added Tailwind's max-width and center alignment classes
                                  images={[
                                    {
                                      image_path: getPublicImageUrl(
                                        'products',
                                        post.id,
                                        post.images[0]?.image_path
                                      ),
                                    },
                                  ]}
                                  fallback="/images/placeholders/612x612.png"
                                  width={100}
                                  height={100}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  <Link
                                    href={`/profile/${contentType}s/add-product?slug=${post.slug}`}
                                    className="hover:text-blue-600"
                                  >
                                    {post.title}
                                  </Link>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {/* Fix 1: Safe property access with optional chaining */}
                                  {(post as any).short_description?.substring(
                                    0,
                                    50
                                  ) || 'No description'}
                                  ...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {/* Fix 2: Proper key handling for categories */}
                              {post.categories.map((category, index) => (
                                <span
                                  key={
                                    typeof category === 'object'
                                      ? category.id
                                      : category
                                  }
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  <CategoryName categoryId={category} />
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {/* Fix 3: Safe property access for price */}
                            {(post as any).price
                              ? `$${(post as any).price}`
                              : 'Contact for Price'}
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
                              href={`/profile/${contentType}s/add-product?slug=${post.slug}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                            {activeTab === 'active' && (
                              <button
                                onClick={() => handleTrash(post.slug)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Trash
                              </button>
                            )}
                            {activeTab === 'trashed' && (
                              <>
                                <button
                                  onClick={() => handleRestore(post.slug)}
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

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={
                            post.featured_image ||
                            '/images/placeholder-product.png'
                          }
                          alt={post.title}
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/profile/${contentType}s/add-product?slug=${post.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {post.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {/* Fix 4: Safe property access for mobile view */}
                            {(post as any).short_description?.substring(
                              0,
                              80
                            ) || 'No description'}
                            ...
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-900">
                              {/* Fix 5: Safe property access for mobile price */}
                              {(post as any).price
                                ? `$${(post as any).price}`
                                : 'Contact for Price'}
                            </span>
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
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                              <Link
                                href={`/${contentType}s/${post.slug}`}
                                className="text-blue-600 hover:text-blue-900 text-xs"
                              >
                                View
                              </Link>
                              <Link
                                href={`/profile/${contentType}s/add-product?slug=${post.slug}`}
                                className="text-indigo-600 hover:text-indigo-900 text-xs"
                              >
                                Edit
                              </Link>
                              {activeTab === 'active' && (
                                <button
                                  onClick={() => handleTrash(post.slug)}
                                  className="text-red-600 hover:text-red-900 text-xs"
                                >
                                  Trash
                                </button>
                              )}
                              {activeTab === 'trashed' && (
                                <>
                                  <button
                                    onClick={() => handleRestore(post.slug)}
                                    className="text-green-600 hover:text-green-900 text-xs"
                                  >
                                    Restore
                                  </button>
                                  <button
                                    onClick={() => handleDelete(post.slug)}
                                    className="text-red-600 hover:text-red-900 text-xs"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing page{' '}
                          <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav
                          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                            {currentPage}
                          </span>

                          <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsListPage;
