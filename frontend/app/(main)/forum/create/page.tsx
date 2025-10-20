'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchCategories } from '@/services/api';
import { createThread } from '@/services/forum';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color?: string;
}

const CreateThreadPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [authLoading, isAuthenticated]);

  // Handle auth modal actions
  const handleSignIn = () => {
    const returnUrl = encodeURIComponent('/forum/create');
    router.push(`/signin?returnUrl=${returnUrl}`);
  };

  const handleCancel = () => {
    router.push('/forum');
  };

  // Fetch categories from backend API
  useEffect(() => {
    const getCategories = async () => {
      try {
        setCategoriesLoading(true);

        const data = await fetchCategories(1, 20);

        // Add default colors if not provided by backend
        const categoriesWithColors = data.map(
          (category: { color?: string }, index: number) => ({
            ...category,
            color: category.color || getDefaultColor(index),
          })
        );

        setCategories(categoriesWithColors);
      } catch (error) {
        console.error('Error fetching categories:', error);

        // Fallback to empty array or mock data if needed
        setCategories([
          {
            id: 1,
            name: 'General Discussion',
            slug: 'general',
            description: 'General discussions and topics',
            color: '#6B7280',
          },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    getCategories();
  }, []);

  // Helper function to get default colors
  const getDefaultColor = (index: number): string => {
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EF4444',
      '#6B7280',
    ];
    return colors[index % colors.length];
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Thread title is required';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Thread content is required';
    } else if (content.trim().length < 20) {
      newErrors.content = 'Content must be at least 20 characters long';
    }

    if (!categoryId) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const newThread = await createThread({
        title: title.trim(),
        content: content.trim(),
        category: categoryId as number,
      });

      // Redirect to the new thread
      router.push(`/forum/${newThread.slug}`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error creating thread:', error);
      setErrors({
        submit: err.message || 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Authentication Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-12a4 4 0 00-8 0v2h8v-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Authentication Required
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                You need to be signed in to create a new forum thread. Would you
                like to sign in now?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg 
                           transition-all duration-200 ease-out font-medium text-sm
                           shadow-sm hover:shadow-md active:scale-95"
                >
                  Go Back to Forum
                </button>
                <button
                  onClick={handleSignIn}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                           transition-all duration-200 ease-out font-medium text-sm
                           shadow-sm hover:shadow-md active:scale-95"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-8 sm:py-6 lg:py-8">
        <div className="mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link
              href="/forum"
              className="hover:text-blue-600 transition-colors"
            >
              Forum
            </Link>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-gray-900 font-medium">Create Thread</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Thread
            </h1>
            <p className="text-gray-600">
              Share your question, experience, or start a discussion with the
              community
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Form */}
            <div className="lg:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Global Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                )}

                {/* Thread Title */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Thread Title
                    </h2>
                  </div>
                  <div className="p-6">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a clear, descriptive title for your thread..."
                      className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl text-sm 
                               placeholder:text-gray-400 text-gray-900
                               focus:outline-none focus:ring-2 focus:bg-white/80
                               transition-all duration-200 ease-out
                               ${
                                 errors.title
                                   ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500/30'
                                   : 'border-gray-200/60 focus:ring-blue-500/20 focus:border-blue-500/30'
                               }`}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.title}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {title.length}/255 characters
                    </p>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Category
                    </h2>
                  </div>
                  <div className="p-6">
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-gray-500">
                          Loading categories...
                        </span>
                      </div>
                    ) : (
                      <>
                        <select
                          value={categoryId}
                          onChange={(e) =>
                            setCategoryId(
                              e.target.value ? parseInt(e.target.value) : ''
                            )
                          }
                          className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl text-sm 
                                   text-gray-900 focus:outline-none focus:ring-2 focus:bg-white/80
                                   transition-all duration-200 ease-out
                                   ${
                                     errors.category
                                       ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500/30'
                                       : 'border-gray-200/60 focus:ring-blue-500/20 focus:border-blue-500/30'
                                   }`}
                        >
                          <option value="">Select a category...</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.category}
                          </p>
                        )}
                        {selectedCategory && (
                          <div className="mt-3 p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: selectedCategory.color,
                                }}
                              ></div>
                              <span className="font-medium text-sm text-gray-900">
                                {selectedCategory.name}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {selectedCategory.description}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Thread Content */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Content
                    </h2>
                  </div>
                  <div className="p-6">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Describe your question, issue, or topic in detail. The more information you provide, the better the community can help you..."
                      rows={12}
                      className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl text-sm 
                               placeholder:text-gray-400 text-gray-900 resize-none
                               focus:outline-none focus:ring-2 focus:bg-white/80
                               transition-all duration-200 ease-out
                               ${
                                 errors.content
                                   ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500/30'
                                   : 'border-gray-200/60 focus:ring-blue-500/20 focus:border-blue-500/30'
                               }`}
                    />
                    {errors.content && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.content}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {content.length} characters (minimum 20)
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Link
                    href="/forum"
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg 
                           transition-all duration-200 ease-out font-medium text-sm text-center
                           shadow-sm hover:shadow-md active:scale-95"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || categoriesLoading}
                    className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                           transition-all duration-200 ease-out font-medium text-sm
                           shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 
                           disabled:cursor-not-allowed disabled:hover:bg-blue-500 disabled:active:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Thread...
                      </div>
                    ) : (
                      'Create Thread'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-1/3 space-y-6">
              {/* Guidelines */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-blue-100/30 border-b border-blue-200/50">
                  <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Posting Guidelines
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Be Specific
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Include relevant details like vehicle make, model, year,
                        and symptoms.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Search First
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Check if your question has already been answered in
                        existing threads.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Choose the Right Category
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Select the most appropriate category to help others find
                        your thread.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Be Respectful
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Keep discussions professional and helpful for everyone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Preview */}
              {!categoriesLoading && categories.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Available Categories
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/60 transition-colors duration-200 cursor-pointer"
                        onClick={() => setCategoryId(category.id)}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {category.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateThreadPage;
