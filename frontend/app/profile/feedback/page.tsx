'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

interface FeedbackFormData {
  name: string;
  email: string;
  category: string;
  rating: number;
  feedback: string;
  suggestions?: string;
}

interface FeedbackState {
  loading: boolean;
  submitting: boolean;
  error: string | null;
  success: string | null;
  showSuccessModal: boolean;
  showErrorModal: boolean;
  isClient: boolean;
}

const FEEDBACK_CATEGORIES = [
  { value: 'general', label: 'General Experience' },
  { value: 'website', label: 'Website/App Performance' },
  { value: 'booking', label: 'Booking Process' },
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'destinations', label: 'Destinations & Activities' },
  { value: 'pricing', label: 'Pricing & Value' },
  { value: 'other', label: 'Other' },
] as const;

const RATING_OPTIONS = [
  { value: 1, label: 'Very Poor', emoji: '😞', color: 'text-red-500' },
  { value: 2, label: 'Poor', emoji: '😕', color: 'text-orange-500' },
  { value: 3, label: 'Average', emoji: '😐', color: 'text-yellow-500' },
  { value: 4, label: 'Good', emoji: '😊', color: 'text-green-500' },
  { value: 5, label: 'Excellent', emoji: '😍', color: 'text-green-600' },
] as const;

export default function FeedbackPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    category: 'general',
    rating: 5,
    feedback: '',
    suggestions: '',
  });

  const [state, setState] = useState<FeedbackState>({
    loading: true,
    submitting: false,
    error: null,
    success: null,
    showSuccessModal: false,
    showErrorModal: false,
    isClient: false,
  });

  // Ensure client-side rendering
  useEffect(() => {
    setState((prev) => ({ ...prev, isClient: true }));
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (state.isClient && !user) {
      router.push('/auth/login');
    }
  }, [user, router, state.isClient]);

  // Pre-fill form with user data
  useEffect(() => {
    if (state.isClient && user && profile) {
      setFormData((prev) => ({
        ...prev,
        name:
          `${profile.user.first_name} ${profile.user.last_name}`.trim() ||
          prev.name,
        email: profile.user.email || prev.email,
      }));

      setState((prev) => ({ ...prev, loading: false }));
    } else if (state.isClient && !user) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.isClient, user, profile]);

  // Handle form field changes
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'rating' ? parseInt(value) : value,
      }));
    },
    []
  );

  // Handle rating selection
  const handleRatingSelect = useCallback((rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  }, []);

  // Submit feedback
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.feedback.trim()
      ) {
        setState((prev) => ({
          ...prev,
          error: 'Please fill in all required fields.',
          showErrorModal: true,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        submitting: true,
        error: null,
        success: null,
      }));

      try {
        // TODO: Replace with actual API call to submit feedback
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            userId: user?.id,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit feedback');
        }

        // Success - reset form and show success message
        setFormData((prev) => ({
          name: prev.name, // Keep user's name
          email: prev.email, // Keep user's email
          category: 'general',
          rating: 5,
          feedback: '',
          suggestions: '',
        }));

        setState((prev) => ({
          ...prev,
          success:
            'Thank you for your feedback! Your input helps us improve our services.',
          showSuccessModal: true,
        }));
      } catch (error) {
        console.error('Error submitting feedback:', error);
        setState((prev) => ({
          ...prev,
          error:
            'Failed to submit your feedback. Please try again or contact us directly.',
          showErrorModal: true,
        }));
      } finally {
        setState((prev) => ({ ...prev, submitting: false }));
      }
    },
    [formData, user]
  );

  // Reset form
  const handleReset = useCallback(() => {
    setFormData((prev) => ({
      name: prev.name, // Keep user's name
      email: prev.email, // Keep user's email
      category: 'general',
      rating: 5,
      feedback: '',
      suggestions: '',
    }));
  }, []);

  // Get selected rating details
  const selectedRating =
    RATING_OPTIONS.find((r) => r.value === formData.rating) ||
    RATING_OPTIONS[4];

  // Loading skeleton for SSR compatibility
  if (!state.isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Share Your Feedback
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Help us improve by sharing your experience and suggestions.
              </p>
            </div>

            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Profile
            </button>
          </div>
        </div>

        <div className="bg-white">
          <div className="rounded-lg shadow">
            <div className="p-6">
              {/* Success/Error Messages */}
              {state.error && !state.showErrorModal && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
                      <p className="text-sm text-red-700">{state.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {state.success && !state.showSuccessModal && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{state.success}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={state.submitting}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={state.submitting}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Feedback Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Feedback Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={state.submitting}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {FEEDBACK_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Overall Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {RATING_OPTIONS.map((rating) => (
                      <button
                        key={rating.value}
                        type="button"
                        onClick={() => handleRatingSelect(rating.value)}
                        disabled={state.submitting}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                          formData.rating === rating.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className="text-2xl mb-1">{rating.emoji}</span>
                        <span className={`text-xs font-medium ${rating.color}`}>
                          {rating.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Selected:{' '}
                    <span className={`font-medium ${selectedRating.color}`}>
                      {selectedRating.emoji} {selectedRating.label}
                    </span>
                  </p>
                </div>

                {/* Feedback */}
                <div>
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Feedback *
                  </label>
                  <textarea
                    id="feedback"
                    name="feedback"
                    rows={6}
                    value={formData.feedback}
                    onChange={handleChange}
                    disabled={state.submitting}
                    placeholder="Please share your experience, what you liked, what could be improved, or any issues you encountered..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-vertical"
                    required
                  />
                </div>

                {/* Suggestions */}
                <div>
                  <label
                    htmlFor="suggestions"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Suggestions for Improvement
                    <span className="text-gray-500 text-xs ml-1">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="suggestions"
                    name="suggestions"
                    rows={4}
                    value={formData.suggestions}
                    onChange={handleChange}
                    disabled={state.submitting}
                    placeholder="Any specific suggestions or ideas for how we can improve our services?"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-vertical"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={state.submitting}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={
                      state.submitting ||
                      !formData.name.trim() ||
                      !formData.email.trim() ||
                      !formData.feedback.trim()
                    }
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {state.submitting ? (
                      <>
                        <InlineLoaderIcon className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
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
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Why Your Feedback Matters
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Helps us understand your experience and needs</li>
              <li>• Guides our product development and service improvements</li>
              <li>
                • Ensures we're delivering the best possible travel experience
              </li>
              <li>• Connects us with our community of travelers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ModalAlert
        isOpen={state.showSuccessModal}
        title="Feedback Submitted!"
        message={state.success || 'Thank you for your valuable feedback.'}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            showSuccessModal: false,
            success: null,
          }))
        }
        onConfirm={() =>
          setState((prev) => ({
            ...prev,
            showSuccessModal: false,
            success: null,
          }))
        }
        confirmText="OK"
        cancelText=""
      />

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
