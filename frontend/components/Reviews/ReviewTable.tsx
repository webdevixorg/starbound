import React from 'react';
import Image from 'next/image';
import { Review } from '@/types/review';
import { StarRating } from './StarRating';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

interface ReviewTableProps {
  reviews: Review[];
  updatingId: number | null;
  deletingId: number | null;
  onApprovalToggle: (id: number, status: number) => void;
  onResponseClick: (review: Review) => void;
  onDeleteClick: (review: Review) => void;
  formatDate: (date: string) => string;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({
  reviews,
  updatingId,
  deletingId,
  onApprovalToggle,
  onResponseClick,
  onDeleteClick,
  formatDate,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Review
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {review.ProfileImage ? (
                        <Image
                          src={review.ProfileImage}
                          alt={review.Name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {review.Name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.Email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {review.product ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {review.product.title}
                      </div>
                      {review.product.category && (
                        <div className="text-sm text-gray-500">
                          {review.product.category}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No product</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StarRating rating={review.rating} />
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p
                      className="text-sm text-gray-900 line-clamp-3"
                      title={review.comment}
                    >
                      {review.comment}
                    </p>
                    {review.helpful_votes && review.helpful_votes > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {review.helpful_votes} found helpful
                      </p>
                    )}
                    {review.response && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <strong>Admin Response:</strong> {review.response}
                        {review.response_date && (
                          <div className="text-gray-500 mt-1">
                            {formatDate(review.response_date)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        review.status === 1
                          ? 'bg-green-100 text-green-800'
                          : review.status === 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {review.status === 1
                        ? 'Approved'
                        : review.status === 0
                          ? 'Pending'
                          : 'Trashed'}
                    </span>
                    {review.flagged && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Flagged
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() =>
                        onApprovalToggle(review.id, review.status === 1 ? 0 : 1)
                      }
                      disabled={updatingId === review.id}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
                        review.status === 1
                          ? 'text-red-700 bg-red-100 hover:bg-red-200'
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                    >
                      {updatingId === review.id ? (
                        <InlineLoaderIcon className="mr-1" />
                      ) : review.status === 1 ? (
                        'Disapprove'
                      ) : (
                        'Approve'
                      )}
                    </button>

                    <button
                      onClick={() => onResponseClick(review)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {review.response ? 'Edit Response' : 'Respond'}
                    </button>

                    <button
                      onClick={() => onDeleteClick(review)}
                      disabled={deletingId === review.id}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {deletingId === review.id ? (
                        <InlineLoaderIcon className="mr-1" />
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
