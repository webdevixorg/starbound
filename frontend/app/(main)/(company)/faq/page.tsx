'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/Common/Loading';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import ModalAlert from '@/components/Modals/ModalAlert';

interface FAQ {
  id: string | number;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  updated_at?: string;
  is_featured?: boolean;
}

interface FAQCategory {
  id: string;
  name: string;
  description?: string;
  faqs: FAQ[];
}

interface FAQPageState {
  loading: boolean;
  faqs: FAQ[];
  categories: FAQCategory[];
  error: string | null;
  showErrorModal: boolean;
  isClient: boolean;
  searchQuery: string;
  selectedCategory: string;
  expandedFAQ: string | number | null;
}

// Mock data for development
const MOCK_FAQS: FAQ[] = [
  {
    id: 1,
    question: 'How do I book a travel package?',
    answer:
      "Booking a travel package is easy! Simply browse our destinations, select your preferred package, choose your travel dates, and proceed to checkout. You can also customize your package by adding or removing services. Our booking system will guide you through each step, and you'll receive a confirmation email once your booking is complete.",
    category: 'booking',
    order: 1,
    is_featured: true,
  },
  {
    id: 2,
    question: 'What is your cancellation policy?',
    answer:
      'Our cancellation policy varies depending on the type of booking and how far in advance you cancel. Generally, cancellations made 30+ days before departure receive a full refund minus processing fees. Cancellations made 15-29 days before departure receive a 50% refund. Cancellations made less than 15 days before departure are non-refundable unless you have travel insurance. Please check your specific booking terms for exact details.',
    category: 'booking',
    order: 2,
    is_featured: true,
  },
  {
    id: 3,
    question: 'Do you offer travel insurance?',
    answer:
      'Yes, we highly recommend purchasing travel insurance to protect your investment. We partner with leading insurance providers to offer comprehensive coverage including trip cancellation, medical emergencies, lost luggage, and travel delays. Insurance can be added during the booking process or purchased separately up to 14 days after your initial booking.',
    category: 'booking',
    order: 3,
  },
  {
    id: 4,
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and in some cases, cryptocurrency. For large bookings, we also offer payment plans where you can pay a deposit to secure your booking and pay the balance closer to your departure date.',
    category: 'payment',
    order: 1,
  },
  {
    id: 5,
    question: 'Can I modify my booking after confirmation?',
    answer:
      'Yes, you can modify your booking depending on availability and the terms of your specific package. Changes to dates, destinations, or services may incur additional fees. We recommend contacting our customer service team as soon as possible if you need to make changes. Some modifications may require rebooking depending on supplier policies.',
    category: 'booking',
    order: 4,
  },
  {
    id: 6,
    question: 'What documents do I need for international travel?',
    answer:
      "For international travel, you'll need a valid passport that doesn't expire within 6 months of your return date. Some destinations also require visas, which you'll need to obtain separately. We provide detailed documentation requirements for each destination in your booking confirmation and pre-departure information. We also recommend checking with your country's foreign affairs department for the latest travel advisories.",
    category: 'travel',
    order: 1,
  },
  {
    id: 7,
    question: 'Are your tours suitable for families with children?',
    answer:
      "Many of our tours are family-friendly and suitable for children of various ages. We clearly indicate age restrictions and recommendations for each tour. Some destinations and activities may have minimum age requirements for safety reasons. We also offer special family packages with child-friendly accommodations and activities. Contact us for personalized recommendations based on your children's ages and interests.",
    category: 'travel',
    order: 2,
  },
  {
    id: 8,
    question: 'What should I do if I have an emergency while traveling?',
    answer:
      'In case of emergency while traveling, first contact local emergency services if immediate assistance is needed. Then contact our 24/7 emergency hotline provided in your travel documents. We have partnerships with local representatives in most destinations who can provide assistance. If you have travel insurance, also contact your insurance provider. Keep copies of important documents in separate locations and register with your embassy if traveling internationally.',
    category: 'travel',
    order: 3,
  },
  {
    id: 9,
    question: 'How do I contact customer support?',
    answer:
      'You can reach our customer support team through multiple channels: email us at support@starbound.com, call our toll-free number 1-800-STARBOUND, or use the live chat feature on our website. Our regular support hours are Monday-Friday 9AM-8PM and Saturday-Sunday 10AM-6PM (EST). For urgent travel-related issues, we have a 24/7 emergency hotline.',
    category: 'support',
    order: 1,
  },
  {
    id: 10,
    question: 'Do you offer group discounts?',
    answer:
      'Yes! We offer attractive group discounts for parties of 8 or more people. Group discounts typically range from 10-20% depending on the destination and package. We also provide dedicated group coordinators to help plan your trip and ensure everyone has a great experience. Contact our group travel specialists for custom quotes and special group amenities.',
    category: 'payment',
    order: 2,
  },
];

const FAQ_CATEGORIES = [
  {
    id: 'all',
    name: 'All Questions',
    description: 'Browse all frequently asked questions',
  },
  {
    id: 'booking',
    name: 'Booking & Reservations',
    description: 'Questions about making and managing bookings',
  },
  {
    id: 'payment',
    name: 'Payment & Pricing',
    description: 'Payment methods, pricing, and refunds',
  },
  {
    id: 'travel',
    name: 'Travel Information',
    description: 'Travel requirements, documentation, and tips',
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Getting help and contacting our team',
  },
];

export default function FAQPage() {
  const router = useRouter();

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
    setState((prev) => ({ ...prev, isClient: true }));
  }, []);

  // Load FAQs
  const loadFAQs = useCallback(async () => {
    if (!state.isClient) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const faqs = MOCK_FAQS;

      // Uncomment when API is ready:
      // const response = await fetch('/api/faqs');
      // if (!response.ok) {
      //   throw new Error('Failed to fetch FAQs');
      // }
      // const data = await response.json();
      // const faqs = data.results || data;

      // Group FAQs by category
      const categorizedFAQs = FAQ_CATEGORIES.map((category) => ({
        ...category,
        faqs:
          category.id === 'all'
            ? faqs
            : faqs.filter((faq) => faq.category === category.id),
      }));

      setState((prev) => ({
        ...prev,
        faqs,
        categories: categorizedFAQs,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading FAQs:', error);
      setState((prev) => ({
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <BreadcrumbsComponent />
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about booking, travel, payments,
            and more. Can't find what you're looking for? Contact our support
            team for personalized assistance.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 max-w-md mx-auto lg:mx-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={state.searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0">
              <select
                value={state.selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white"
              >
                {FAQ_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Description */}
        {currentCategory && currentCategory.description && (
          <div className="mb-8 text-center">
            <p className="text-lg text-gray-600">
              {currentCategory.description}
            </p>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''}{' '}
            found
            {state.searchQuery && <span> for "{state.searchQuery}"</span>}
          </p>
        </div>

        {/* FAQ List */}
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {state.searchQuery
                ? 'No matching questions found'
                : 'No questions available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {state.searchQuery
                ? `No FAQs match "${state.searchQuery}". Try a different search term or browse by category.`
                : 'There are no questions in this category yet.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {state.searchQuery && (
                <button
                  onClick={() =>
                    setState((prev) => ({ ...prev, searchQuery: '' }))
                  }
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => router.push('/contact')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className={`border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 ${
                  state.expandedFAQ === faq.id
                    ? 'shadow-md'
                    : 'shadow-sm hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => handleFAQToggle(faq.id)}
                  className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {faq.is_featured && (
                        <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 pr-8">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          state.expandedFAQ === faq.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    state.expandedFAQ === faq.id
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <div className="pt-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>

      {/* Error Modal */}
      <ModalAlert
        isOpen={state.showErrorModal}
        title="Error"
        message={state.error || 'An unexpected error occurred.'}
        onClose={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        onConfirm={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}
