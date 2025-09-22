'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  helpCenterAPI,
  HelpCategory,
  HelpArticle,
  supportUtils,
} from '@/services/apiSupport';
import ModalAlert from '@/components/Modals/ModalAlert';

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);

  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    'title' | 'created_at' | 'view_count' | 'helpful_votes'
  >('title');

  const fetchCategoryData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch category details and articles in parallel
      const [categoriesData, articlesData] = await Promise.all([
        helpCenterAPI.getCategories(),
        helpCenterAPI.getArticles({ category: categoryId }),
      ]);

      const currentCategory = categoriesData.find(
        (cat) => cat.id === categoryId
      );
      setCategory(currentCategory || null);
      setArticles(articlesData.results);
    } catch (err) {
      setError('Failed to load category data');
      console.error('Error fetching category data:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId, fetchCategoryData]);

  const sortedArticles = [...articles].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created_at':
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'view_count':
        return b.view_count - a.view_count;
      case 'helpful_votes':
        return b.helpful_votes - a.helpful_votes;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Category Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The requested help category could not be found.
          </p>
          <button
            onClick={() => router.push('/support/help')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Help Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/support/help')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Help Center
          </button>

          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {category.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>{articles.length} articles</span>
            <span>•</span>
            <span>
              Last updated {supportUtils.formatDate(category.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <ModalAlert
            isOpen={!!error}
            onClose={() => setError(null)}
            title="Error"
            message={error}
          />
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Articles in {category.name}
          </h2>

          <div className="flex items-center space-x-4">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | 'title'
                    | 'created_at'
                    | 'view_count'
                    | 'helpful_votes'
                )
              }
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="title">Title (A-Z)</option>
              <option value="created_at">Newest first</option>
              <option value="view_count">Most viewed</option>
              <option value="helpful_votes">Most helpful</option>
            </select>
          </div>
        </div>

        {/* Articles List */}
        {sortedArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No articles found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no published articles in this category yet.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/support/contact/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Contact Support
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() =>
                  router.push(`/support/help/articles/${article.id}`)
                }
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {article.title}
                      </h3>
                      {article.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    {article.summary && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                        <span>{article.view_count} views</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span>👍 {article.helpful_votes}</span>
                        <span>👎 {article.not_helpful_votes}</span>
                      </div>

                      <span>
                        Updated {supportUtils.formatDate(article.updated_at)}
                      </span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Actions */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Still Need Help?
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => router.push('/support/contact/new')}
              className="bg-white p-4 rounded-lg shadow text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Contact Support
                  </h4>
                  <p className="text-xs text-gray-500">
                    Get personalized assistance
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/support/feedback')}
              className="bg-white p-4 rounded-lg shadow text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Suggest Improvement
                  </h4>
                  <p className="text-xs text-gray-500">
                    Help us make this better
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
