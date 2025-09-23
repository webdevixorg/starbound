'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import {
  feedbackAPI,
  CreateFeedbackData,
  supportUtils,
} from '@/services/apiSupport';

interface FeedbackFormData {
  subject: string;
  contact_email: string;
  feedback_type: string;
  overall_rating: number;
  message: string;
  allow_contact: boolean;
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
  { value: 'general', label: 'General Feedback' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement Suggestion' },
  { value: 'compliment', label: 'Compliment' },
  { value: 'complaint', label: 'Complaint' },
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
    subject: '',
    contact_email: '',
    feedback_type: 'general',
    overall_rating: 5,
    message: '',
    allow_contact: true,
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
      router.push('/signin');
    }
  }, [user, router, state.isClient]);

  // Pre-fill form with user data
  useEffect(() => {
    if (state.isClient && user && profile && profile.user) {
      setFormData((prev) => ({
        ...prev,
        subject: prev.subject,
        contact_email: profile.user?.email || prev.contact_email,
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
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'number' || name === 'overall_rating'
            ? parseInt(value)
            : type === 'checkbox'
              ? (e.target as HTMLInputElement).checked
              : value,
      }));
    },
    []
  );

  // Handle rating selection
  const handleRatingSelect = useCallback((rating: number) => {
    setFormData((prev) => ({ ...prev, overall_rating: rating }));
  }, []);

  // Submit feedback
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (
        !formData.subject.trim() ||
        !formData.contact_email.trim() ||
        !formData.message.trim()
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
        const feedbackData: CreateFeedbackData = {
          feedback_type: formData.feedback_type,
          subject: formData.subject,
          message: formData.message,
          overall_rating: formData.overall_rating,
          contact_email: formData.contact_email,
          allow_contact: formData.allow_contact,
          browser_info: supportUtils.getBrowserInfo(),
          page_url: supportUtils.getCurrentPageUrl(),
        };

        await feedbackAPI.createFeedback(feedbackData);

        // Success - reset form and show success message
        setFormData((prev) => ({
          subject: '',
          contact_email: prev.contact_email, // Keep user's email
          feedback_type: 'general',
          overall_rating: 5,
          message: '',
          allow_contact: true,
        }));

        setState((prev) => ({
          ...prev,
          success:
            'Thank you for your feedback! Your input helps us improve our services.',
          showSuccessModal: true,
        }));
      } catch (error: unknown) {
        console.error('Error submitting feedback:', error);

        const errorMessage =
          error instanceof Error &&
          'response' in error &&
          typeof (error as { response?: { data?: { message?: string } } })
            .response?.data?.message === 'string'
            ? (error as { response: { data: { message: string } } }).response
                .data.message
            : 'Failed to submit your feedback. Please try again or contact us directly.';

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          showErrorModal: true,
        }));
      } finally {
        setState((prev) => ({ ...prev, submitting: false }));
      }
    },
    [formData]
  );

  // Reset form
  const handleReset = useCallback(() => {
    setFormData((prev) => ({
      subject: '',
      contact_email: prev.contact_email, // Keep user's email
      feedback_type: 'general',
      overall_rating: 5,
      message: '',
      allow_contact: true,
    }));
  }, []);

  // Get selected rating details
  const selectedRating =
    RATING_OPTIONS.find((r) => r.value === formData.overall_rating) ||
    RATING_OPTIONS[4];

  // Loading skeleton for SSR compatibility
  if (!state.isClient) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="min-h-screen bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Share Your Feedback
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Help us improve by sharing your experience and suggestions.
              </p>
            </div>
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
                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={state.submitting}
                      placeholder="Brief description of your feedback"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="contact_email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="contact_email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      disabled={state.submitting}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Feedback Type */}
                <div>
                  <label
                    htmlFor="feedback_type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Feedback Type
                  </label>
                  <select
                    id="feedback_type"
                    name="feedback_type"
                    value={formData.feedback_type}
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
                          formData.overall_rating === rating.value
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

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Feedback *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={state.submitting}
                    placeholder="Please share your experience, what you liked, what could be improved, or any issues you encountered..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-vertical"
                    required
                  />
                </div>

                {/* Allow Contact Checkbox */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_contact"
                      checked={formData.allow_contact}
                      onChange={handleChange}
                      disabled={state.submitting}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Allow our team to contact me about this feedback
                    </span>
                  </label>
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
                      !formData.subject.trim() ||
                      !formData.contact_email.trim() ||
                      !formData.message.trim()
                    }
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {state.submitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
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
                • Ensures we&apos;re delivering the best possible travel
                experience
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
