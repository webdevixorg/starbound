// filepath: c:\Web Server\GitHub\Starbound\frontend\app\profile\dashboard\page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useAuthRedirect';
import { useWishlist } from '@/context/WishlistContext';
import {
  fetchOrders,
  fetchAllReviews,
  fetchReviewsByUserId,
} from '@/services/apiProducts';
import { fetchVisitHistory, fetchConversations } from '@/services/api';
import { fetchUserForumPosts, fetchForumThreads } from '@/services/forum';
import LoadingSpinner from '@/components/Common/Loading';
import SummaryCard from '@/components/PageComponents/Dashboard/SummeryCard';
import SafeImage from '@/components/UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';
import { ForumPost, Conversation } from '@/types/types';
import { Review } from '@/types/review';

type RecentItem = {
  price?: number;
  id: string | number;
  title: string;
  slug?: string;
  image?: string;
  subtitle?: string;
  date?: string;
  type?: 'product' | 'message' | 'comment' | 'forum';
};

const RecentList: React.FC<{
  title: string;
  items: RecentItem[];
  linkBase: string;
  showImage?: boolean;
  showDate?: boolean;
  emptyIcon?: string;
  emptyMessage?: string;
  viewAllLink?: string;
}> = ({
  title,
  items,
  linkBase,
  showImage = false,
  showDate = false,
  emptyIcon = '📝',
  emptyMessage = 'No recent items to display.',
  viewAllLink,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center gap-1"
          >
            View All
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">{emptyIcon}</div>
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <li
              key={item.id}
              className="group relative bg-gradient-to-r from-gray-50/50 to-blue-50/30 hover:from-blue-50/80 hover:to-indigo-50/60 
                         rounded-xl border border-gray-100 hover:border-blue-200/60 p-4 transition-all duration-300 
                         hover:shadow-lg hover:shadow-blue-100/40 transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-4">
                {showImage && item.image && (
                  <div className="relative flex-shrink-0">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-white">
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl"></div>
                    </div>
                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    href={`${linkBase}/${item.slug || item.id}`}
                    className="block group-hover:text-blue-700 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-800 transition-colors duration-200 truncate leading-5">
                          {item.title}
                        </h4>

                        {item.subtitle && (
                          <p className="text-xs text-gray-500 mt-1 truncate font-medium">
                            {item.subtitle}
                          </p>
                        )}

                        {item.price && (
                          <div className="flex items-center mt-2">
                            <span className="text-lg font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors duration-200">
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

                      <div className="flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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

                  <div className="h-px bg-gradient-to-r from-transparent via-blue-200/0 to-transparent group-hover:via-blue-200/60 transition-all duration-300 mt-3"></div>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-100/0 to-indigo-100/0 group-hover:from-blue-100/80 group-hover:to-indigo-100/80 rotate-45 transition-all duration-300"></div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function AutomotiveDashboard() {
  const { user, role } = useAuth();
  const { isClient: isClientRole } = useUserRole();
  const { wishlist } = useWishlist();

  // Determine if user is admin or staff
  const isAdminOrStaff = role === 'admin' || role === 'staff';

  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [forumPosts, setForumPosts] = useState<RecentItem[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentItem[]>([]);
  const [userReviews, setUserReviews] = useState<RecentItem[]>([]);
  const [visited, setVisited] = useState<RecentItem[]>([]);
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

        // Determine what data to fetch based on role
        const fetchForumData = isAdminOrStaff
          ? () => fetchForumThreads({ pageSize: 5 }) // All forum posts for admin/staff
          : () =>
              user
                ? fetchUserForumPosts(user.id, 5)
                : Promise.resolve({ results: [] }); // User's posts only

        const fetchMessageData = isAdminOrStaff
          ? () => fetchConversations() // All conversations for admin/staff
          : () => (user ? fetchConversations() : Promise.resolve([])); // User's conversations only

        const fetchReviewData = isAdminOrStaff
          ? () => fetchAllReviews() // All reviews for admin/staff
          : () => (user ? fetchReviewsByUserId(user.id) : Promise.resolve([])); // User's reviews only

        // Fetch all data concurrently
        const [
          ordersData,
          reviewsData,
          forumData,
          messagesData,
          userReviewsData,
        ] = await Promise.allSettled([
          fetchOrders(), // Always fetch orders (but count shows different meaning for admin vs user)
          fetchAllReviews(), // Always fetch all for count
          fetchForumData(),
          fetchMessageData(),
          fetchReviewData(),
        ]);

        // Handle orders
        if (ordersData.status === 'fulfilled') {
          setOrderCount(ordersData.value.results?.length || 0);
        } else {
          console.error('Failed to fetch orders:', ordersData.reason);
        }

        // Handle reviews count
        if (reviewsData.status === 'fulfilled') {
          setReviewsCount(reviewsData.value.results?.length || 0);
        } else {
          console.error('Failed to fetch reviews:', reviewsData.reason);
        }

        // Handle forum posts
        if (forumData.status === 'fulfilled') {
          const forumItems: RecentItem[] =
            forumData.value.results?.slice(0, 5).map((post: ForumPost) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              subtitle: isAdminOrStaff
                ? `${post.category.name} • by ${post.user?.first_name || 'User'}`
                : post.category.name,
              date: new Date(post.created_at).toLocaleDateString(),
              type: 'forum',
            })) || [];
          setForumPosts(forumItems);
        } else {
          console.error('Failed to fetch forum posts:', forumData.reason);
          setForumPosts([]);
        }

        // Handle messages/conversations
        if (messagesData.status === 'fulfilled') {
          const messageItems: RecentItem[] =
            messagesData.value
              ?.slice(0, 5)
              .map((conversation: Conversation) => ({
                id: conversation.id,
                title: conversation.title || 'Conversation',
                subtitle: `${conversation.participants?.length || 0} participants`,
                date:
                  conversation.messages?.length > 0
                    ? new Date(
                        conversation.messages[
                          conversation.messages.length - 1
                        ].timestamp
                      ).toLocaleDateString()
                    : new Date().toLocaleDateString(),
                type: 'message',
              })) || [];
          setRecentMessages(messageItems);
        } else {
          console.error('Failed to fetch messages:', messagesData.reason);
          setRecentMessages([]);
        }

        // Handle user reviews (for comments section)
        if (userReviewsData.status === 'fulfilled') {
          // Handle different response structures - some APIs return {results: []} others return direct array
          const reviewsArray = Array.isArray(userReviewsData.value)
            ? userReviewsData.value
            : userReviewsData.value?.results || [];

          const reviewItems: RecentItem[] =
            reviewsArray?.slice(0, 5).map((review: Review) => ({
              id: review.id,
              title:
                review.comment?.length > 50
                  ? review.comment.substring(0, 50) + '...'
                  : review.comment || 'No comment',
              subtitle: review.product?.title || 'Product Review',
              date: new Date(review.created_at).toLocaleDateString(),
              type: 'comment',
            })) || [];
          setUserReviews(reviewItems);
        } else {
          console.error(
            'Failed to fetch user reviews:',
            userReviewsData.reason
          );
          setUserReviews([]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [isClient, user, isAdminOrStaff]);

  // Fetch visit history
  useEffect(() => {
    if (!isClient) return;

    const fetchVisitData = async () => {
      try {
        const history = await fetchVisitHistory();
        const recent: RecentItem[] = history.slice(0, 5).map(
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
            price: v.product?.price ? `$${v.product.price}` : '',
            type: 'product',
          })
        );
        setVisited(recent);
      } catch (err) {
        console.error('Failed to fetch visit history:', err);
        setVisited([]);
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
      {/* Elegant Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user?.first_name || 'User'}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here&apos;s what&apos;s happening with your automotive journey.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards - Role-based content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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
          href="/profile/forum"
          color="purple"
          icon="forum"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentList
          title="Recently Visited Products"
          items={visited}
          linkBase="/shop"
          showImage
          emptyIcon="🛍️"
          emptyMessage="No recent product visits."
          viewAllLink="/profile/history"
        />

        <RecentList
          title={
            isAdminOrStaff ? 'Recent Forum Posts' : 'My Recent Forum Posts'
          }
          items={forumPosts}
          linkBase="/forum"
          showDate
          emptyIcon="💬"
          emptyMessage={
            isAdminOrStaff ? 'No recent forum posts.' : 'No recent forum posts.'
          }
          viewAllLink={isAdminOrStaff ? '/forum' : '/profile/forum'}
        />

        <RecentList
          title={isAdminOrStaff ? 'Recent Messages' : 'Recent Messages'}
          items={recentMessages}
          linkBase="/profile/messages"
          showDate
          emptyIcon="📨"
          emptyMessage="No recent messages."
          viewAllLink="/profile/messages"
        />

        <RecentList
          title={isAdminOrStaff ? 'Recent Comments' : 'Recent Comments'}
          items={userReviews}
          linkBase="/shop"
          showDate
          emptyIcon="⭐"
          emptyMessage="No recent reviews or comments."
          viewAllLink="/profile/reviews"
        />
      </div>

      {/* Quick Actions - Role-based actions */}
      <div className="mt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Shop Parts - Show for all users */}
          <Link
            href="/shop"
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl text-center hover:shadow-xl hover:bg-white transition-all duration-300 border border-white/50 hover:border-blue-200 transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              🛒
            </div>
            <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
              Shop Parts
            </div>
          </Link>

          {/* Orders - Different text for different roles */}
          <Link
            href="/profile/my-orders"
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl text-center hover:shadow-xl hover:bg-white transition-all duration-300 border border-white/50 hover:border-blue-200 transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              📦
            </div>
            <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
              {isClientRole ? 'My Orders' : 'Manage Orders'}
            </div>
          </Link>

          {/* Wishlist - Show for clients, Reviews for admin/staff */}
          {isClientRole ? (
            <Link
              href="/profile/wishlist"
              className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl text-center hover:shadow-xl hover:bg-white transition-all duration-300 border border-white/50 hover:border-blue-200 transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                ❤️
              </div>
              <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                My Wishlist
              </div>
            </Link>
          ) : (
            <Link
              href="/profile/reviews"
              className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl text-center hover:shadow-xl hover:bg-white transition-all duration-300 border border-white/50 hover:border-blue-200 transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                ⭐
              </div>
              <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                Manage Reviews
              </div>
            </Link>
          )}

          {/* Forum - Show for all users */}
          <Link
            href="/forum"
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl text-center hover:shadow-xl hover:bg-white transition-all duration-300 border border-white/50 hover:border-blue-200 transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              💬
            </div>
            <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
              Forum
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
