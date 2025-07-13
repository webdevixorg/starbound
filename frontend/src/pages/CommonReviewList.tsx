import React, { useEffect, useState } from 'react';
import { fetchAllReviews, updateReviewApproval } from '../services/apiProducts';

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at?: string;
  approved?: boolean;
  Name: string;
  Email: string;
  ProfileImage: string;
  product?: {
    id: number;
    title: string;
  };
}

const CommonReviewDashboard: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetchAllReviews(); // Must return paginated { count, next, previous, results }
      setReviews(Array.isArray(response.results) ? response.results : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprovalToggle = async (id: number, approved: boolean) => {
    try {
      setUpdatingId(id);
      await updateReviewApproval(id, { approved });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, approved } : r))
      );
    } catch (error) {
      console.error('Failed to update approval:', error);
      alert('Failed to update approval status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading reviews...</div>;
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Customer Reviews
        </h2>
        <button
          onClick={loadReviews}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Profile
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Rating
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Comment
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={review.ProfileImage || '/default-profile.jpg'}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {review.Name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {review.Email}
                  </td>
                  <td className="px-4 py-3 text-sm text-yellow-600">
                    {review.rating} / 5
                  </td>
                  <td
                    className="px-4 py-3 text-sm max-w-xs truncate"
                    title={review.comment}
                  >
                    {review.comment}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-700">
                    {review.product?.title || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {review.approved ? (
                      <span className="text-green-600 font-medium">
                        Approved
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      disabled={updatingId === review.id}
                      onClick={() =>
                        handleApprovalToggle(review.id, !review.approved)
                      }
                      className={`px-3 py-1 text-sm text-white rounded ${
                        review.approved
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } disabled:opacity-50`}
                    >
                      {review.approved ? 'Disapprove' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CommonReviewDashboard;
