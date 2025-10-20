'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  fetchCategories,
  deleteCategory,
  addCategory,
  updateCategory,
} from '@/services/api';
import { useContent } from '@/context/ContentContext';
import { Category } from '@/types/types';
import { slugify } from '@/helpers/common';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';

const CategoriesPage: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get content type from URL params or default to 'post'
  const contentTypeParam = searchParams.get('type') || 'post';

  const { contentTypes, loading: contentLoading } = useContent();

  const [contentTypeId, setContentTypeId] = useState<number>();
  const [currentContentType, setCurrentContentType] =
    useState<string>(contentTypeParam);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<{
    id?: number;
    oldSlug?: string;
    slug: string;
    name: string;
    description: string;
    parent: number | null | Category | null;
    content_type_id?: number;
  }>({
    name: '',
    description: '',
    slug: '',
    parent: null,
  });

  // Determine content type ID based on the type parameter
  useEffect(() => {
    if (contentLoading || !contentTypes) return;

    const matched = Array.isArray(contentTypes)
      ? contentTypes.find((ct: any) => ct.model === contentTypeParam)
      : Object.values(contentTypes).find(
          (ct: any) => ct.model === contentTypeParam
        );

    if (matched) {
      setContentTypeId(matched.id);
      setCurrentContentType(contentTypeParam);
    }
  }, [contentTypes, contentLoading, contentTypeParam]);

  // Load categories when content type changes
  useEffect(() => {
    if (!contentTypeId) return;

    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchCategories(
          currentPage,
          pageSize,
          contentTypeId
        );
        setCategories(response?.results || response || []);
        setTotalPages(
          Math.ceil((response?.count || response?.length || 0) / pageSize)
        );
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to fetch categories.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [currentPage, contentTypeId]);

  // Reset page when content type changes
  useEffect(() => {
    setCurrentPage(1);
    setShowAddForm(false);
    setEditMode(false);
    setNewCategory({ name: '', slug: '', description: '', parent: null });
  }, [contentTypeParam]);

  const handleDelete = useCallback(async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await deleteCategory(slug);
      if (response.ok || response.status === 204) {
        setCategories((prev) => prev.filter((cat) => cat.slug !== slug));
      } else {
        setError('Delete failed.');
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Error deleting category.');
      setShowErrorModal(true);
    }
  }, []);

  const handleAddCategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError(null);

      try {
        const categoryData = {
          ...newCategory,
          content_type_id: contentTypeId ?? 0,
        };

        const result = editMode
          ? await updateCategory(newCategory.oldSlug!, categoryData)
          : await addCategory(categoryData);

        const updatedCategories = editMode
          ? categories.map((cat) => (cat.id === result.id ? result : cat))
          : [...categories, result];

        setCategories(updatedCategories);
        setShowAddForm(false);
        setEditMode(false);
        setNewCategory({ name: '', slug: '', description: '', parent: null });
      } catch (err) {
        console.error('Error saving category:', err);
        setError('Error saving category.');
        setShowErrorModal(true);
      } finally {
        setSubmitting(false);
      }
    },
    [editMode, newCategory, contentTypeId, categories]
  );

  const handleEdit = useCallback(
    (cat: Category) => {
      setNewCategory({
        id: cat.id,
        oldSlug: cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? '',
        parent: cat.parent ?? null,
        content_type_id: contentTypeId,
      });
      setShowAddForm(true);
      setEditMode(true);
    },
    [contentTypeId]
  );

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setNewCategory((prev) => ({ ...prev, name, slug: slugify(name) }));
    },
    []
  );

  const handleTypeSwitch = useCallback((newType: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('type', newType);
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  }, []);

  const renderCategories = useMemo(() => {
    const recursive = (cats: Category[], level: number = 0): React.ReactNode =>
      cats.map((cat) => (
        <React.Fragment key={cat.id}>
          <tr className="hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 border-b border-gray-200">
              <span className="text-gray-400">{'— '.repeat(level)}</span>
              <span className="text-gray-900">{cat.name}</span>
            </td>
            <td className="py-3 px-4 border-b border-gray-200">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {cat.slug}
              </code>
            </td>
            <td className="py-3 px-4 border-b border-gray-200 text-gray-600">
              {cat.description || 'No description'}
            </td>
            <td className="py-3 px-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.slug)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          {cat.children && recursive(cat.children, level + 1)}
        </React.Fragment>
      ));
    return recursive(categories);
  }, [categories, handleDelete, handleEdit]);

  // Show loading spinner during initial load
  if (loading && contentLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentContentType === 'post' ? 'Post' : 'Product'} Categories
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage {currentContentType === 'post' ? 'post' : 'product'}{' '}
                categories
              </p>
            </div>

            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a
                    href="/profile"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Profile
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-1 text-gray-500 md:ml-2">
                      Categories
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Type Switcher */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={currentContentType}
              onChange={(e) => handleTypeSwitch(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="post">Post Categories</option>
              <option value="product">Product Categories</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => handleTypeSwitch('post')}
                className={`${
                  currentContentType === 'post'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Post Categories
              </button>
              <button
                onClick={() => handleTypeSwitch('product')}
                className={`${
                  currentContentType === 'product'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Product Categories
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Loading Overlay */}
          {submitting && (
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <div
            className={`transition-opacity ${
              submitting ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {/* Header with Add Button */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Manage {currentContentType === 'post' ? 'Post' : 'Product'}{' '}
                  Categories
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setEditMode(false);
                    setNewCategory({
                      name: '',
                      slug: '',
                      description: '',
                      parent: null,
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  {showAddForm ? (
                    <>
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add New
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={handleNameChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter category name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        value={newCategory.slug}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="category-slug"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter category description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Category
                    </label>
                    <select
                      value={
                        newCategory.parent ? String(newCategory.parent) : ''
                      }
                      onChange={(e) =>
                        setNewCategory((prev) => ({
                          ...prev,
                          parent: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">None (Top Level)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {editMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {editMode ? 'Update Category' : 'Create Category'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories Table */}
            <div className="px-6 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No categories found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first {currentContentType}{' '}
                    category.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add First Category
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Slug
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {renderCategories}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ModalAlert
        isOpen={showErrorModal}
        title="Error"
        message={error || 'An unexpected error occurred.'}
        onClose={() => {
          setShowErrorModal(false);
          setError(null);
        }}
        onConfirm={() => {
          setShowErrorModal(false);
          setError(null);
        }}
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
};

export default CategoriesPage;
