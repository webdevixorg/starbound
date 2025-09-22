'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  helpCenterAPI,
  HelpCategory,
  HelpArticle,
} from '@/services/apiSupport';
import { faqGroups, categoriesData } from '@/lists/helpCenter';
import { useDebounce } from '@/hooks/useDebounce';

// Local interface for categories data from lists
interface LocalCategory {
  title: string;
  description: string;
  link: string;
}

// Local interface for FAQ items from lists
interface FAQItemType {
  question: string;
  answer: string;
}

// Lazy load components that aren't immediately visible
const LoadingSpinner = dynamic(() => import('@/components/Common/Loading'), {
  ssr: false,
});

// Memoized components for better performance
const CategoryCard = memo(
  ({ category, onClick }: { category: LocalCategory; onClick: () => void }) => (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
    >
      <h2 className="text-xl font-semibold text-blue-600 mb-2">
        {category.title}
      </h2>
      <p className="text-gray-700">{category.description}</p>
      <span className="text-blue-600 mt-4 inline-block">Learn More →</span>
    </div>
  )
);

CategoryCard.displayName = 'CategoryCard';

const FAQItem = memo(
  ({ item }: { item: FAQItemType; groupIdx: number; itemIdx: number }) => (
    <div className="flex items-start mb-8">
      <div className="hidden sm:flex items-center justify-center p-3 mr-3 rounded-full bg-blue-500 text-white border-4 border-white text-xl font-semibold">
        <svg
          width="24px"
          height="24px"
          fill="white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g data-name="Layer 2">
            <g data-name="menu-arrow">
              <rect
                width="24"
                height="24"
                transform="rotate(180 12 12)"
                opacity="0"
              />
              <path d="M17 9A5 5 0 0 0 7 9a1 1 0 0 0 2 0 3 3 0 1 1 3 3 1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-1.1A5 5 0 0 0 17 9z" />
              <circle cx="12" cy="19" r="1" />
            </g>
          </g>
        </svg>
      </div>
      <div className="text-md">
        <h3 className="text-gray-900 font-semibold mb-2">{item.question}</h3>
        <p className="text-gray-500 text-sm">{item.answer}</p>
      </div>
    </div>
  )
);

FAQItem.displayName = 'FAQItem';

const SearchResults = memo(
  ({
    results,
    onArticleClick,
  }: {
    results: HelpArticle[];
    onArticleClick: (id: number) => void;
  }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Results</h2>
      {results.length === 0 ? (
        <p className="text-gray-500">No articles found matching your search.</p>
      ) : (
        <div className="space-y-4">
          {results.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article.id)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {article.content.substring(0, 200)}...
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Category: {article.category_name}</span>
                <span className="mx-2">•</span>
                <span>{article.view_count || 0} views</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
);

SearchResults.displayName = 'SearchResults';

interface OptimizedState {
  categories: HelpCategory[];
  featuredArticles: HelpArticle[];
  searchResults: HelpArticle[];
  loading: boolean;
  searching: boolean;
  error: string | null;
}

const HelpCenterPage: React.FC = () => {
  const router = useRouter();

  // Consolidated state for better performance
  const [state, setState] = useState<OptimizedState>({
    categories: [],
    featuredArticles: [],
    searchResults: [],
    loading: true,
    searching: false,
    error: null,
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized filtered categories for local search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categoriesData;

    return categoriesData.filter((category) =>
      `${category.title} ${category.description}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Optimized data fetching
  const fetchInitialData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Parallel API calls for better performance
      const [categoriesResponse, featuredResponse] = await Promise.all([
        helpCenterAPI.getCategories(),
        helpCenterAPI.getArticles({ featured: true }),
      ]);

      setState((prev) => ({
        ...prev,
        categories: Array.isArray(categoriesResponse) ? categoriesResponse : [],
        featuredArticles: featuredResponse.results?.slice(0, 6) || [],
        loading: false,
      }));
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load help center data',
        loading: false,
      }));
    }
  }, []);

  // Optimized search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState((prev) => ({ ...prev, searchResults: [], searching: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, searching: true }));

      const response = await helpCenterAPI.searchArticles(query);

      setState((prev) => ({
        ...prev,
        searchResults: response.results || [],
        searching: false,
      }));
    } catch (err) {
      console.error('Error searching articles:', err);
      setState((prev) => ({
        ...prev,
        searchResults: [],
        searching: false,
        error: 'Search failed. Please try again.',
      }));
    }
  }, []);

  const handleArticleClick = useCallback(
    (articleId: number) => {
      router.push(`/support/help/articles/${articleId}`);
    },
    [router]
  );

  const handleContactSupport = useCallback(() => {
    router.push('/support/contact');
  }, [router]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Effects
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Find answers to your questions and get the help you need
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-4 text-lg text-gray-900 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                />
                {state.searching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {state.error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{state.error}</p>
          </div>
        )}

        {/* Search Results */}
        {searchQuery.trim() && (
          <SearchResults
            results={state.searchResults}
            onArticleClick={handleArticleClick}
          />
        )}

        {/* Show categories and FAQs only when not searching */}
        {!searchQuery.trim() && (
          <>
            {/* Featured Articles */}
            {state.featuredArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Featured Articles
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {state.featuredArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {article.content.substring(0, 120)}...
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{article.view_count || 0} views</span>
                        <span className="text-blue-600">Read more →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Browse by Category
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category, idx) => (
                  <CategoryCard
                    key={idx}
                    category={category}
                    onClick={() => category.link && router.push(category.link)}
                  />
                ))}
              </div>

              {filteredCategories.length === 0 && (
                <p className="text-gray-500 text-center">
                  No categories found matching your search.
                </p>
              )}
            </section>

            {/* FAQs */}
            <section className="mb-12">
              <div className="mb-8">
                <p className="text-sm font-medium text-gray-500 mb-2">F.A.Q</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  Frequently Asked{' '}
                  <span className="text-blue-600">Questions</span>
                </h2>
              </div>

              <div className="space-y-12">
                {faqGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="sm:flex items-start">
                    <h3 className="py-3 font-bold text-lg text-gray-900 w-full sm:w-3/12 mb-4 sm:mb-0">
                      {group.title}
                    </h3>
                    <div className="w-full sm:w-9/12">
                      {group.items.map((item, itemIdx) => (
                        <FAQItem
                          key={itemIdx}
                          item={item}
                          groupIdx={groupIdx}
                          itemIdx={itemIdx}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Quick Links */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need More Help?
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
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
                  <p className="text-xs text-gray-500">Get personalized help</p>
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
                    Give Feedback
                  </h4>
                  <p className="text-xs text-gray-500">Share your thoughts</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/support/contact')}
              className="bg-white p-4 rounded-lg shadow text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    My Tickets
                  </h4>
                  <p className="text-xs text-gray-500">View your requests</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Contact Section */}
        <section className="bg-white rounded-xl p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our friendly support team is here to help! Get in touch and
            we&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContactSupport}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Contact Support
            </button>
            <button
              onClick={() => window.open('tel:1-800-STARBOUND', '_self')}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call Us
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HelpCenterPage;
