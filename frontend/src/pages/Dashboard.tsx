// src/pages/AutomotiveDashboard.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchOrders, fetchAllReviews } from '../services/apiProducts';
import { fetchVisitHistory } from '../services/api';
import SummaryCard from '../components/PageComponents/Dashboard/SummeryCard';


export default function AutomotiveDashboard() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [visited, setVisited] = useState<
    { id: number; title: string; slug: string; image?: string }[]
  >([]);

  // Fetch orders and reviews
  useEffect(() => {
    (async () => {
      try {
        const ordersData = await fetchOrders();
        setOrderCount(ordersData.results?.length || 0);

        const reviewsData = await fetchAllReviews();
        setReviewsCount(reviewsData.results?.length || 0);
      } catch (err) {
        console.error('Failed to fetch orders or reviews:', err);
      }
    })();
  }, []);

  // Fetch visit history
  useEffect(() => {
    (async () => {
      try {
        const history = await fetchVisitHistory();
        const recent = history.slice(0, 5).map((v: { item_id: any; product: { title: any; slug: any; image: any; }; }) => ({
          id: v.item_id,
          title: v.product?.title || `Product #${v.item_id}`,
          slug: v.product?.slug || String(v.item_id),
          image: v.product?.image,
        }));
        setVisited(recent);
      } catch (err) {
        console.error('Failed to fetch visit history:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-lg text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Welcome {user?.first_name}!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <SummaryCard
          title="Total Orders"
          count={orderCount}
          href="/orders"
          color="blue"
          icon="orders"
        />
        <SummaryCard
          title="Wishlist Items"
          count={wishlist.length}
          href="/wishlist"
          color="green"
          icon="wishlist"
        />
        <SummaryCard
          title="Reviews Written"
          count={reviewsCount}
          href={user?.groups === 1 ? '/all-reviews' : '/reviews'}
          color="yellow"
          icon="reviews"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <RecentList
          title="Recently Visited Products"
          items={visited}
          linkBase="/products"
          showImage
        />

        <RecentList
          title="Recent Messages"
          items={[
            { id: 1, title: 'Order #1234 Update' },
            { id: 2, title: 'Welcome to Logivis Automotive' },
          ]}
          linkBase="/messages"
        />

        <RecentList
          title="Recent Forum Posts"
          items={[
            { id: 1, title: 'Best Car Battery Brand in 2025?' },
            { id: 2, title: 'Tips for Diagnosing Hybrid Systems' },
          ]}
          linkBase="/forum"
        />

        <RecentList
          title="Recent Comments"
          items={[
            { id: 1, title: 'Thanks! This article really helped.' },
            { id: 2, title: 'Looking forward to more content.' },
          ]}
          linkBase="/comments"
        />
      </div>
    </div>
  );
}

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
    <div className="bg-white border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No recent items to display.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center space-x-3 border-b pb-2 last:border-none"
            >
              {showImage && item.image && (
                <img
                  src={'http://127.0.0.1:8000/media/' + item.image}
                  alt={item.title}
                  className="h-10 w-10 object-cover rounded"
                />
              )}
              <a
                href={`${linkBase}/${item.slug || item.id}`}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-150"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
