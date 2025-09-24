'use client';

import React, { useState, useEffect } from 'react';

interface ProductReview {
  id: number;
  product: {
    id: number;
    title: string;
    image: string;
    category: string;
  };
  rating: number;
  comment: string;
  author: string;
  created_at: string;
  helpful_count: number;
  verified_purchase: boolean;
}

const ProductReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchReviews = async () => {
      try {
        // Mock data - replace with actual API call
        const mockReviews: ProductReview[] = [
          {
            id: 1,
            product: {
              id: 101,
              title: 'High-Performance Car Audio System',
              image: '/images/audio-system.jpg',
              category: 'Audio Systems',
            },
            rating: 5,
            comment:
              'Exceptional sound quality and easy installation. The bass response is incredible and the highs are crystal clear. Worth every penny!',
            author: 'Mike Thompson',
            created_at: '2024-01-15',
            helpful_count: 24,
            verified_purchase: true,
          },
          {
            id: 2,
            product: {
              id: 102,
              title: 'LED Headlight Conversion Kit',
              image: '/images/led-headlights.jpg',
              category: 'Lighting',
            },
            rating: 4,
            comment:
              'Great brightness improvement over stock halogen bulbs. Installation was straightforward with the included instructions.',
            author: 'Sarah Rodriguez',
            created_at: '2024-01-12',
            helpful_count: 18,
            verified_purchase: true,
          },
          {
            id: 3,
            product: {
              id: 103,
              title: 'Performance Cold Air Intake',
              image: '/images/cold-air-intake.jpg',
              category: 'Performance Parts',
            },
            rating: 5,
            comment:
              'Noticeable improvement in throttle response and engine sound. Quality construction and perfect fit for my vehicle.',
            author: 'David Chen',
            created_at: '2024-01-10',
            helpful_count: 31,
            verified_purchase: true,
          },
          {
            id: 4,
            product: {
              id: 104,
              title: 'Premium Floor Mats Set',
              image: '/images/floor-mats.jpg',
              category: 'Interior',
            },
            rating: 4,
            comment:
              'High quality materials and perfect fit. Easy to clean and they look great in my car.',
            author: 'Jennifer Wilson',
            created_at: '2024-01-08',
            helpful_count: 12,
            verified_purchase: true,
          },
          {
            id: 5,
            product: {
              id: 105,
              title: 'Carbon Fiber Spoiler',
              image: '/images/spoiler.jpg',
              category: 'Exterior',
            },
            rating: 5,
            comment:
              'Beautiful finish and really enhances the look of my vehicle. Installation was professional grade.',
            author: 'Alex Kim',
            created_at: '2024-01-05',
            helpful_count: 27,
            verified_purchase: true,
          },
        ];

        setReviews(mockReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const categories = [
    'all',
    'Audio Systems',
    'Lighting',
    'Performance Parts',
    'Interior',
    'Exterior',
  ];

  const filteredReviews = reviews.filter(
    (review) =>
      selectedCategory === 'all' || review.product.category === selectedCategory
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">
                Loading product reviews...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Product Reviews
            </h1>
          </div>
          <p className="text-lg text-gray-600 ml-11">
            Read authentic reviews from verified customers to make informed
            purchasing decisions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Product Info */}
                <div className="lg:w-1/3">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.product.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {review.product.category}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="lg:w-2/3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {renderStars(review.rating)}
                      {review.verified_purchase && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {review.created_at}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {review.comment}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      — {review.author}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
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
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8a2 2 0 01-2-2V6a2 2 0 012-2h2.343M11 7L9 5l2-2m0 0l2 2-2 2m0-2V3"
                        />
                      </svg>
                      <span>{review.helpful_count} found this helpful</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.066 2.378l-.553.553a1 1 0 11-1.414-1.414l.553-.553C6.34 14.145 9.036 13 12 13c2.964 0 5.66 1.145 7.48 3.464l.553.553a1 1 0 11-1.414 1.414l-.553-.553C16.47 15.899 14.34 15 12 15z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewsPage;
