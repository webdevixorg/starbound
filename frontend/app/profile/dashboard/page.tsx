'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { fetchOrders, fetchAllReviews } from '@/services/apiProducts';
import { fetchVisitHistory } from '@/services/api';
import LoadingSpinner from '@/components/Common/Loading';
import SummaryCard from '@/components/PageComponents/Dashboard/SummeryCard';

type RecentItem = {
  id: string | number;
  title: string;
  slug?: string;
  image?: string;
};

const RecentList: React.FC<{
  title: string;
  items: RecentItem[];
  linkBase: string;
  showImage?: boolean;
}> = ({ title, items, linkBase, showImage = false }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No recent items to display.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center space-x-3 border-b border-gray-100 pb-2 last:border-none"
            >
              {showImage && item.image && (
                <div className="flex-shrink-0">
                  <img
                    src={`${
                      process.env.NEXT_PUBLIC_API_BASE_URL ||
                      'http://127.0.0.1:8000'
                    }/media/${item.image}`}
                    alt={item.title}
                    className="h-10 w-10 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-product.png';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={`${linkBase}/${item.slug || item.id}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-150 truncate block"
                >
                  {item.title}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function AutomotiveDashboard() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [visited, setVisited] = useState<
    { id: number; title: string; slug: string; image?: string }[]
  >([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch orders and reviews
  useEffect(() => {
    if (!isClient) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch orders and reviews in parallel
        const [ordersData, reviewsData] = await Promise.allSettled([
          fetchOrders(),
          fetchAllReviews(),
        ]);

        if (ordersData.status === 'fulfilled') {
          setOrderCount(ordersData.value.results?.length || 0);
        } else {
          console.error('Failed to fetch orders:', ordersData.reason);
        }

        if (reviewsData.status === 'fulfilled') {
          setReviewsCount(reviewsData.value.results?.length || 0);
        } else {
          console.error('Failed to fetch reviews:', reviewsData.reason);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [isClient]);

  // Fetch visit history
  useEffect(() => {
    if (!isClient) return;

    const fetchVisitData = async () => {
      try {
        const history = await fetchVisitHistory();
        const recent = history
          .slice(0, 5)
          .map(
            (v: {
              item_id: any;
              product: { title: any; slug: any; image: any };
            }) => ({
              id: v.item_id,
              title: v.product?.title || `Product #${v.item_id}`,
              slug: v.product?.slug || String(v.item_id),
              image: v.product?.image,
            })
          );
        setVisited(recent);
      } catch (err) {
        console.error('Failed to fetch visit history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitData();
  }, [isClient]);

  // Show loading skeleton until client-side hydration
  if (!isClient) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 border border-gray-200 rounded-lg"
              >
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="h-4 bg-gray-200 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.first_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your automotive journey.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <SummaryCard
          title="Total Orders"
          count={orderCount}
          href="/profile/orders"
          color="blue"
          icon="orders"
        />
        <SummaryCard
          title="Wishlist Items"
          count={wishlist.length}
          href="/profile/wishlist"
          color="green"
          icon="wishlist"
        />
        <SummaryCard
          title="Reviews Written"
          count={reviewsCount}
          href={
            user?.groups === 1 ? '/profile/all-reviews' : '/profile/reviews'
          }
          color="yellow"
          icon="reviews"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentList
          title="Recently Visited Products"
          items={visited}
          linkBase="/shop"
          showImage
        />

        <RecentList
          title="Recent Messages"
          items={[
            { id: 1, title: 'Order #1234 has been shipped' },
            { id: 2, title: 'Welcome to Logivis Automotive' },
            { id: 3, title: 'Your review has been approved' },
          ]}
          linkBase="/profile/messages"
        />

        <RecentList
          title="Recent Forum Posts"
          items={[
            { id: 1, title: 'Best Car Battery Brand in 2025?' },
            { id: 2, title: 'Tips for Diagnosing Hybrid Systems' },
            { id: 3, title: 'Electric Vehicle Maintenance Guide' },
          ]}
          linkBase="/forum"
        />

        <RecentList
          title="Recent Comments"
          items={[
            { id: 1, title: 'Thanks! This article really helped.' },
            { id: 2, title: 'Looking forward to more content.' },
            { id: 3, title: 'Great product review!' },
          ]}
          linkBase="/profile/comments"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/shop"
            className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🛒</div>
            <div className="text-sm font-medium text-gray-700">Shop Parts</div>
          </Link>
          <Link
            href="/profile/orders"
            className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-medium text-gray-700">
              Track Orders
            </div>
          </Link>
          <Link
            href="/profile/wishlist"
            className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">❤️</div>
            <div className="text-sm font-medium text-gray-700">
              View Wishlist
            </div>
          </Link>
          <Link
            href="/profile/settings"
            className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-medium text-gray-700">Settings</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
