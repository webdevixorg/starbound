import React, { useState, useEffect } from 'react';
import {
  createReview,
  fetchReviewsByProductID,
} from '../../services/apiProducts';
import StarIcon from '../UI/Icons/Star';

// Review type
interface Review {
  id?: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
  product_id?: number;
  created_at?: string;
  profile_image?: string; // filename or partial path
}

// Product type
interface Product {
  id: number;
  title: string;
}

// ReviewsList Component
interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  // Format date nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="reviews-list">
      <h2 className="text-xl font-bold mb-4">
        Customer Reviews ({reviews.length})
      </h2>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div
            key={review.id || review.email}
            className="review-item border-b py-4 flex items-start gap-4"
          >
            <div className="profile-image w-12 h-12 flex-shrink-0">
              <img
                src={review.profile_image || '/default-profile.jpg'}
                alt={`${review.name}'s profile`}
                className="rounded-full w-12 h-12 object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.src = '/default-profile.jpg';
                    target.dataset.fallback = 'true';
                  }
                }}
              />
            </div>

            <div className="flex-1">
              <p className="font-bold">{review.name}</p>

              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} filled={i < review.rating} />
                ))}
              </div>
              <p className="text-sm">{review.comment}</p>
              <p className="text-xs text-gray-500 mb-1">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>There are no reviews yet.</p>
      )}
    </div>
  );
};

// ReviewForm Component
interface ReviewFormProps {
  onSubmit: (formData: Review) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reviewToSubmit: Review = {
      ...formData,
      rating: parseInt(formData.rating, 10),
    };

    await onSubmit(reviewToSubmit);
    setFormData({ name: '', email: '', rating: '', comment: '' });
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="review-form p-4 border rounded bg-white"
    >
      <div className="mb-4">
        <label className="block font-bold" htmlFor="name">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-bold" htmlFor="email">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-bold" htmlFor="rating">
          Rating *
        </label>
        <select
          id="rating"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select Rating</option>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Average</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Terrible</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-bold" htmlFor="comment">
          Comment *
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          value={formData.comment}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${
          isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        } text-white py-2 px-4 rounded`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

// Main ReviewsSystem Component
interface ReviewsSystemProps {
  product: Product;
}

const ReviewsSystem: React.FC<ReviewsSystemProps> = ({ product }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const fetchedReviews = await fetchReviewsByProductID(product.id);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        alert('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [product.id]);

  const addReview = async (newReview: Review) => {
    try {
      const reviewToCreate = { ...newReview, product_id: product.id };
      const createdReview = await createReview(reviewToCreate);
      setReviews((prevReviews) => [createdReview, ...prevReviews]);
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to submit your review. Please try again.');
    }
  };

  return (
    <div className="container mx-auto reviews-container my-6">
      <div className="reviews-content flex flex-col md:flex-row gap-4">
        <div className="reviews-list-section md:w-1/2 p-4">
          {loading ? (
            <p>Loading reviews...</p>
          ) : (
            <ReviewsList reviews={reviews} />
          )}
        </div>

        <div className="review-form-section md:w-1/2 p-4">
          {reviews.length < 1 && !loading && (
            <h4 className="text-lg font-bold mb-2 text-gray-700">
              Be the first to leave a review for "{product.title}".
            </h4>
          )}
          <ReviewForm onSubmit={addReview} />
        </div>
      </div>
    </div>
  );
};

export default ReviewsSystem;
