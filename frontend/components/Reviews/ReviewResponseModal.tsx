import React from 'react';
import { Review } from '@/types/review';
import { StarRating } from './StarRating';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

interface ReviewResponseModalProps {
  isOpen: boolean;
  review: Review | null;
  responseText: string;
  isUpdating: boolean;
  onClose: () => void;
  onResponseChange: (text: string) => void;
  onSubmit: () => void;
}

export const ReviewResponseModal: React.FC<ReviewResponseModalProps> = ({
  isOpen,
  review,
  responseText,
  isUpdating,
  onClose,
  onResponseChange,
  onSubmit,
}) => {
  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {review.response ? 'Edit Response' : 'Respond to Review'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <strong className="text-sm">{review.Name}</strong>
            <span className="ml-2">
              <StarRating rating={review.rating} />
            </span>
          </div>
          <p className="text-sm text-gray-700">{review.comment}</p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="response-text"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Response
          </label>
          <textarea
            id="response-text"
            rows={4}
            value={responseText}
            onChange={(e) => onResponseChange(e.target.value)}
            placeholder="Write your response to this review..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!responseText.trim() || isUpdating}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <>
                <InlineLoaderIcon className="mr-2" />
                Saving...
              </>
            ) : review.response ? (
              'Update Response'
            ) : (
              'Post Response'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
