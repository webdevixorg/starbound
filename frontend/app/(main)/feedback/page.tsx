'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  feedbackAPI,
  CreateFeedbackData,
  supportUtils,
} from '@/services/apiSupport';
import ModalAlert from '@/components/Modals/ModalAlert';

const FeedbackPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateFeedbackData>({
    feedback_type: 'suggestion',
    subject: '',
    message: '',
    overall_rating: 5,
    ease_of_use: 5,
    features: 5,
    customer_service: 5,
    contact_email: user?.email || '',
    allow_contact: true,
    browser_info: '', // Will be set in useEffect
    page_url: '', // Will be set in useEffect
  });

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  // Set client-side data to avoid SSR issues
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      browser_info: supportUtils.getBrowserInfo(),
      page_url: supportUtils.getCurrentPageUrl(),
    }));
  }, []);

  const feedbackTypes = [
    {
      value: 'bug_report',
      label: 'Bug Report',
      description: 'Report a problem or error',
    },
    {
      value: 'feature_request',
      label: 'Feature Request',
      description: 'Suggest a new feature',
    },
    {
      value: 'suggestion',
      label: 'Suggestion',
      description: 'General improvement ideas',
    },
    {
      value: 'complaint',
      label: 'Complaint',
      description: 'Report an issue or concern',
    },
    {
      value: 'compliment',
      label: 'Compliment',
      description: 'Share positive feedback',
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'range' || name.includes('rating')) {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: 'screenshot' | 'attachment'
  ) => {
    const file = e.target.files?.[0] || null;
    if (fileType === 'screenshot') {
      setScreenshot(file);
    } else {
      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const feedbackData: CreateFeedbackData = {
        ...formData,
        screenshot: screenshot || undefined,
        attachment: attachment || undefined,
      };

      await feedbackAPI.createFeedback(feedbackData);

      setSuccess(
        'Thank you for your feedback! We appreciate you taking the time to help us improve.'
      );

      // Reset form
      setFormData((prev) => ({
        feedback_type: 'suggestion',
        subject: '',
        message: '',
        overall_rating: 5,
        ease_of_use: 5,
        features: 5,
        customer_service: 5,
        contact_email: user?.email || '',
        allow_contact: true,
        browser_info: supportUtils.getBrowserInfo(),
        page_url: prev.page_url, // Keep the current page URL
      }));
      setScreenshot(null);
      setAttachment(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : 'Failed to submit feedback. Please try again.';

      setError(errorMessage);
      console.error('Error submitting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating: number): string => {
    const labels = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Fair',
      4: 'Good',
      5: 'Excellent',
    };
    return labels[rating as keyof typeof labels] || 'Unknown';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign in to submit feedback.
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/support')}
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
            Back to Support
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Send Feedback</h1>
          <p className="mt-2 text-gray-600">
            Help us improve our platform by sharing your thoughts, suggestions,
            or reporting issues
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <ModalAlert
            isOpen={!!success}
            onClose={() => setSuccess(null)}
            title="Thank You!"
            message={success}
          />
        )}

        {/* Error Message */}
        {error && (
          <ModalAlert
            isOpen={!!error}
            onClose={() => setError(null)}
            title="Error"
            message={error}
          />
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Feedback Type <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                {feedbackTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.feedback_type === type.value
                        ? 'border-blue-600 ring-2 ring-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback_type"
                      value={type.value}
                      checked={formData.feedback_type === type.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex flex-1">
                      <div className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-900">
                          {type.label}
                        </span>
                        <span className="mt-1 flex items-center text-sm text-gray-500">
                          {type.description}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brief summary of your feedback"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Details <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Provide detailed feedback. Include steps to reproduce if reporting a bug..."
                required
              />
            </div>

            {/* Ratings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rate Your Experience
              </h3>
              <div className="space-y-4">
                {/* Overall Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="overall_rating"
                      className="text-sm font-medium text-gray-700"
                    >
                      Overall Experience
                    </label>
                    <span className="text-sm text-gray-500">
                      {getRatingLabel(formData.overall_rating || 5)}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="overall_rating"
                    name="overall_rating"
                    min="1"
                    max="5"
                    value={formData.overall_rating || 5}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Very Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Ease of Use */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="ease_of_use"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ease of Use
                    </label>
                    <span className="text-sm text-gray-500">
                      {getRatingLabel(formData.ease_of_use || 5)}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="ease_of_use"
                    name="ease_of_use"
                    min="1"
                    max="5"
                    value={formData.ease_of_use || 5}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Very Difficult</span>
                    <span>Very Easy</span>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="features"
                      className="text-sm font-medium text-gray-700"
                    >
                      Features & Functionality
                    </label>
                    <span className="text-sm text-gray-500">
                      {getRatingLabel(formData.features || 5)}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="features"
                    name="features"
                    min="1"
                    max="5"
                    value={formData.features || 5}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Customer Service */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="customer_service"
                      className="text-sm font-medium text-gray-700"
                    >
                      Customer Service
                    </label>
                    <span className="text-sm text-gray-500">
                      {getRatingLabel(formData.customer_service || 5)}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="customer_service"
                    name="customer_service"
                    min="1"
                    max="5"
                    value={formData.customer_service || 5}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact_email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="allow_contact"
                  name="allow_contact"
                  type="checkbox"
                  checked={formData.allow_contact || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="allow_contact"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Allow us to contact you about this feedback
                </label>
              </div>
            </div>

            {/* File Attachments */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Screenshot */}
              <div>
                <label
                  htmlFor="screenshot"
                  className="block text-sm font-medium text-gray-700"
                >
                  Screenshot (Optional)
                </label>
                <div className="mt-1">
                  <input
                    id="screenshot"
                    name="screenshot"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'screenshot')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="image/*"
                  />
                  {screenshot && (
                    <span className="text-sm text-green-600 mt-1 block">
                      {screenshot.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Attachment */}
              <div>
                <label
                  htmlFor="attachment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Attachment (Optional)
                </label>
                <div className="mt-1">
                  <input
                    id="attachment"
                    name="attachment"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'attachment')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".pdf,.doc,.docx,.txt,.zip"
                  />
                  {attachment && (
                    <span className="text-sm text-green-600 mt-1 block">
                      {attachment.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && (
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
                )}
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>

        {/* Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Looking for help?{' '}
            <button
              onClick={() => router.push('/support/help')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Visit our Help Center
            </button>{' '}
            or{' '}
            <button
              onClick={() => router.push('/support/contact/new')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
