'use client';

import LoadingSpinner from '@/components/Common/Loading';
import router from 'next/router';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { faqGroups, categoriesData } from '@/lists/helpCenter';
import { FAQPageState } from '@/types/types';

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const [state, setState] = useState<FAQPageState>({
    loading: true,
    faqs: [],
    categories: [],
    error: null,
    showErrorModal: false,
    isClient: false,
    searchQuery: '',
    selectedCategory: 'all',
    expandedFAQ: null,
  });

  // Ensure client-side rendering
  useEffect(() => {
    setState((prev: any) => ({ ...prev, isClient: true }));
  }, []);

  // Load FAQs
  const loadFAQs = useCallback(async () => {
    if (!state.isClient) return;

    setState((prev: any) => ({ ...prev, loading: true, error: null }));

    try {
      const faqs = faqGroups;

      setState((prev: any) => ({
        ...prev,
        faqs,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading FAQs:', error);
      setState((prev: any) => ({
        ...prev,
        error: 'Failed to load FAQs. Please try again later.',
        showErrorModal: true,
        loading: false,
      }));
    }
  }, [state.isClient]);

  // Initial load
  useEffect(() => {
    if (state.isClient) {
      loadFAQs();
    }
  }, [loadFAQs, state.isClient]);

  // Handle search and filtering
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, searchQuery: e.target.value }));
    },
    []
  );

  const handleCategoryChange = useCallback((category: string) => {
    setState((prev) => ({
      ...prev,
      selectedCategory: category,
      expandedFAQ: null, // Reset expanded FAQ when changing categories
    }));
  }, []);

  const handleFAQToggle = useCallback((faqId: string | number) => {
    setState((prev) => ({
      ...prev,
      expandedFAQ: prev.expandedFAQ === faqId ? null : faqId,
    }));
  }, []);

  // Filter FAQs based on search and category
  const filteredFAQs = React.useMemo(() => {
    let filtered = state.faqs;

    // Filter by category
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(
        (faq) => faq.category === state.selectedCategory
      );
    }

    // Filter by search query
    if (state.searchQuery) {
      filtered = filtered.filter(
        (faq) =>
          faq.question
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }

    // Sort by order and featured status
    return filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (a.order || 999) - (b.order || 999);
    });
  }, [state.faqs, state.selectedCategory, state.searchQuery]);

  // Get current category info
  const currentCategory = state.categories.find(
    (cat) => cat.id === state.selectedCategory
  );

  const filteredCategories = categoriesData.filter((category) =>
    `${category.title} ${category.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Loading skeleton for SSR compatibility
  if (!state.isClient) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition">
            Contact Support
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 text-lg border rounded-lg shadow focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
          />
        </div>

        {/* Categories */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition category"
            >
              <h2 className="text-xl font-semibold text-blue-600 mb-2">
                {category.title}
              </h2>
              <p className="text-gray-700">{category.description}</p>
              <a
                href={category.link}
                className="text-blue-600 mt-4 inline-block"
              >
                Learn More →
              </a>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              No matching help topics found.
            </p>
          )}
        </section>

        {/* FAQs */}
        <section className="mt-12">
          <div className="">
            <div className="mb-16">
              <p className="mt-4 text-sm leading-7 text-gray-500">F.A.Q</p>
              <h3 className="text-3xl sm:text-4xl leading-normal font-extrabold tracking-tight text-gray-900">
                Frequently Asked
                <span className="text-blue-600 ml-2">Questions</span>
              </h3>
            </div>

            {faqGroups.map((group, idx) => (
              <div key={idx} className="sm:flex items-start mb-10">
                <h3 className="py-3 font-bold text-lg text-gray-900 w-full sm:w-3/12">
                  {group.title}
                </h3>
                <div className="w-full sm:w-9/12">
                  {group.items.map((item, index) => (
                    <div key={index} className="flex items-start mb-8">
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
                        <h1 className="text-gray-900 font-semibold mb-2">
                          {item.question}
                        </h1>
                        <p className="text-gray-500 text-sm">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our friendly support team is here to help! Get in touch and we'll
            get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/contact')}
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
                  d="M3 8l7.89 4.47a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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
        </div>
      </main>
    </div>
  );
}
