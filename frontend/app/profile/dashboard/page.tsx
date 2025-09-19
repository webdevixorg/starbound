// filepath: c:\Web Server\GitHub\Starbound\frontend\app\profile\dashboard\page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useAuthRedirect';
import { useWishlist } from '@/context/WishlistContext';
import { fetchOrders, fetchAllReviews } from '@/services/apiProducts';
import { fetchVisitHistory } from '@/services/api';
import { fetchUserForumPosts } from '@/services/forum'; // Add this import
import LoadingSpinner from '@/components/Common/Loading';
import SummaryCard from '@/components/PageComponents/Dashboard/SummeryCard';
import SafeImage from '@/components/UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';
import { ForumPost } from '@/types/types';

type RecentItem = {
  price?: number;
  id: string | number;
  title: string;
  slug?: string;
  image?: string;
  subtitle?: string; // Add subtitle for forum posts
  date?: string; // Add date for forum posts
};

const RecentList: React.FC<{
  title: string;
  items: RecentItem[];
  linkBase: string;
  showImage?: boolean;
  showDate?: boolean;
}> = ({ title, items, linkBase, showImage = false, showDate = false }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-sm text-gray-500">No recent items to display.</p>
        </div>
      ) : (
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              className="group relative bg-white hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 
                         rounded-xl border border-gray-100 hover:border-blue-200/50 p-4 transition-all duration-300 
                         hover:shadow-md hover:shadow-blue-100/50"
            >
              <div className="flex items-center space-x-4">
                {showImage && item.image && (
                  <div className="relative flex-shrink-0">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                      <SafeImage
                        alt={item.title}
                        className="relative h-14 w-14 object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 30vw, 33vw"
                        images={[
                          {
                            image_path: getPublicImageUrl(
                              'products',
                              typeof item.id === 'string'
                                ? parseInt(item.id, 10)
                                : item.id,
                              item.image
                            ),
                          },
                        ]}
                        width={400}
                        height={300}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    </div>
                    <div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 to-indigo-400/0 
                                    group-hover:from-blue-400/10 group-hover:to-indigo-400/10 transition-all duration-300 -z-10 blur-sm"
                    ></div>
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    href={`${linkBase}/${item.slug || item.id}`}
                    className="block group-hover:text-blue-700 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-sm font-semibold text-gray-900 group-hover:text-blue-800 
                                     transition-colors duration-200 truncate"
                        >
                          {item.title}
                        </h4>

                        {item.subtitle && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {item.subtitle}
                          </p>
                        )}

                        {item.price && (
                          <div className="flex items-center mt-1">
                            <span
                              className="text-lg font-bold text-emerald-600 group-hover:text-emerald-700 
                                           transition-colors duration-200"
                            >
                              {item.price}
                            </span>
                          </div>
                        )}

                        {showDate && item.date && (
                          <p className="text-xs text-gray-400 mt-1">
                            {item.date}
                          </p>
                        )}
                      </div>

                      <div
                        className="flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 transform 
                                    translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                      >
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>

                  <div
                    className="h-px bg-gradient-to-r from-transparent via-blue-200/0 to-transparent 
                                group-hover:via-blue-200/50 transition-all duration-300 mt-3"
                  ></div>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-100/0 to-indigo-100/0 
                               group-hover:from-blue-100/60 group-hover:to-indigo-100/60 rotate-45 transition-all duration-300"
                ></div>
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
  const { isClient: isClientRole } = useUserRole();
  const { wishlist } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [forumPosts, setForumPosts] = useState<RecentItem[]>([]); // Add forum posts state
  const [visited, setVisited] = useState<
    { id: number; title: string; slug: string; image?: string }[]
  >([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!isClient) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [ordersData, reviewsData, forumData] = await Promise.allSettled([
          fetchOrders(),
          fetchAllReviews(),
          user
            ? fetchUserForumPosts(user.id, 5)
            : Promise.resolve({ results: [] }),
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

        // Handle forum posts
        if (forumData.status === 'fulfilled') {
          const forumItems: RecentItem[] =
            forumData.value.results?.map((post: ForumPost) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              subtitle: post.category.name,
              date: new Date(post.created_at).toLocaleDateString(),
            })) || [];
          setForumPosts(forumItems);
        } else {
          console.error('Failed to fetch forum posts:', forumData.reason);
          setForumPosts([]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [isClient, user]);

  // Fetch visit history
  useEffect(() => {
    if (!isClient) return;

    const fetchVisitData = async () => {
      try {
        const history = await fetchVisitHistory();
        const recent = history.slice(0, 5).map(
          (v: {
            item_id: number;
            product: {
              price: number;
              title: string;
              slug: string;
              image: string;
            };
          }) => ({
            id: v.item_id,
            title: v.product?.title || `Product #${v.item_id}`,
            slug: v.product?.slug,
            image: v.product?.image,
            price: v.product?.price || '',
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
    <div className="p-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.first_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s what&apos;s happening with your automotive journey.
        </p>
      </div>

      {/* Summary Cards - Role-based content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Orders Card - Different for client vs admin/staff */}
        <SummaryCard
          title={isClientRole ? 'My Orders' : 'Total Orders'}
          count={orderCount}
          href="/profile/orders"
          color="blue"
          icon="orders"
        />

        {/* Wishlist - Show for all users */}
        <SummaryCard
          title="Wishlist Items"
          count={wishlist.length}
          href="/profile/wishlist"
          color="green"
          icon="wishlist"
        />

        {/* Reviews Card - Different for client vs admin/staff */}
        <SummaryCard
          title={isClientRole ? 'My Reviews' : 'All Reviews'}
          count={reviewsCount}
          href={isClientRole ? '/profile/my-reviews' : '/profile/reviews'}
          color="yellow"
          icon="reviews"
        />

        {/* Forum Posts - Show for all users */}
        <SummaryCard
          title="Forum Posts"
          count={forumPosts.length}
          href="/forum/my-posts"
          color="purple"
          icon="forum"
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
          title="My Recent Forum Posts"
          items={forumPosts}
          linkBase="/forum"
          showDate
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
          title="Recent Comments"
          items={[
            { id: 1, title: 'Thanks! This article really helped.' },
            { id: 2, title: 'Looking forward to more content.' },
            { id: 3, title: 'Great product review!' },
          ]}
          linkBase="/profile/comments"
        />
      </div>

      {/* Quick Actions - Role-based actions */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Shop Parts - Show for all users */}
          <Link
            href="/shop"
            className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🛒</div>
            <div className="text-sm font-medium text-gray-700">Shop Parts</div>
          </Link>

          {/* Orders - Different text for different roles */}
          <Link
            href="/profile/orders"
            className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-medium text-gray-700">
              {isClientRole ? 'My Orders' : 'Manage Orders'}
            </div>
          </Link>

          {/* Wishlist - Show for clients, Reviews for admin/staff */}
          {isClientRole ? (
            <Link
              href="/profile/wishlist"
              className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">❤️</div>
              <div className="text-sm font-medium text-gray-700">
                My Wishlist
              </div>
            </Link>
          ) : (
            <Link
              href="/profile/reviews"
              className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-sm font-medium text-gray-700">
                Manage Reviews
              </div>
            </Link>
          )}

          {/* Forum - Show for all users */}
          <Link
            href="/forum"
            className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-medium text-gray-700">Forum</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
