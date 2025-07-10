import React, { useEffect, useState } from 'react';
import { fetchReviewsByUserId } from '../services/apiProducts';
import { useAuth } from '../context/AuthContext'; // to get logged-in user

type Review = {
  id: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
  created_at?: string;
  approved?: boolean;
  product?: {
    title: string;
  };
};

const ReviewDashboard: React.FC = () => {
  const { user } = useAuth(); // get logged-in user info
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadReviews = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await fetchReviewsByUserId(user.id);
      const allReviews = Array.isArray(data) ? data : [];
      setReviews(allReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading reviews...</div>;
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Product
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Comment
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Rating
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {review.product?.title || '—'}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate"
                    title={review.comment}
                  >
                    {review.comment}
                  </td>
                  <td className="px-4 py-3 text-sm text-yellow-600 font-medium">
                    {review.rating} / 5
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewDashboard;
