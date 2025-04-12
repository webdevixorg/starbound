import React, { useState, useEffect } from 'react';
import { createReview, fetchReviews } from '../../services/apiProducts';

// Define the review type
interface Review {
  id?: number; // Optional ID for API integration
  name: string;
  email: string;
  rating: number;
  comment: string;
}

// Define the product type
interface Product {
  title: string;
}

// ReviewsList Component
interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  return (
    <div className="reviews-list">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div
            key={review.id || review.email} // Ensure unique key
            className="review-item border-b py-4"
          >
            <p className="font-bold">{review.name}</p>
            <p className="text-sm text-gray-600">{review.email}</p>
            <p className="text-yellow-500">
              Rating: {'⭐'.repeat(review.rating)}
            </p>
            <p>{review.comment}</p>
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Button state

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formDataWithNumberRating = {
      ...formData,
      rating: parseInt(formData.rating, 10),
    };
    await onSubmit(formDataWithNumberRating);
    setFormData({ name: '', email: '', rating: '', comment: '' }); // Reset form
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="review-form p-4 border rounded">
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
        ></textarea>
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

// Main Review System Component
interface ReviewsSystemProps {
  product: Product;
}

const ReviewsSystem: React.FC<ReviewsSystemProps> = ({ product }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch reviews on component mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const fetchedReviews = await fetchReviews();
        setReviews(fetchedReviews); // Assuming fetchedReviews is an array
      } catch (error) {
        console.error('Error fetching reviews:', error);
        alert('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  const addReview = async (newReview: Review) => {
    try {
      const createdReview = await createReview(newReview);
      setReviews([createdReview, ...reviews]); // Add the new review to the top
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to submit your review. Please try again.');
    }
  };

  return (
    <div className="container reviews-container">
      <div className="reviews-content flex">
        <div className="reviews-list-section w-1/2 p-4">
          {loading ? (
            <p>Loading reviews...</p>
          ) : (
            <ReviewsList reviews={reviews} />
          )}
        </div>

        <div className="review-form-section w-1/2 p-4">
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
