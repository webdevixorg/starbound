import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPosts } from '@/services/api';
import { Post } from '@/types/types';
import { formatDate } from '@/helpers/common';
import SafeImage from '../UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface PostListSidebarProps {
  filter: string;
  count: number;
  title?: string;
  className?: string;
}

const PostListSidebar: React.FC<PostListSidebarProps> = ({
  filter,
  count,
  title = 'Related Posts',
  className = '',
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchPosts(1, count, filter, 'post');
        setPosts(data.results);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [filter, count]);

  if (loading) {
    return (
      <div
        className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden ${className}`}
      >
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
            <Skeleton width={150} />
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton width={64} height={64} className="rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={16} />
                  <Skeleton height={12} width="50%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {title}
        </h3>
      </div>

      {/* Posts List */}
      <div className="divide-y divide-gray-100/70">
        {posts.map((post, index) => (
          <article
            key={post.id}
            className="group hover:bg-gray-50/60 transition-all duration-300 ease-out"
          >
            <Link
              href={`/posts/${post.slug}`}
              className="flex items-center gap-4 p-4"
            >
              {/* Post Image */}
              <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                <SafeImage
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  images={[
                    {
                      image_path: getPublicImageUrl(
                        'posts',
                        post.id,
                        post.images?.[0]?.image_path + '_thumb.webp'
                      ),
                    },
                  ]}
                  fallback="/images/placeholders/612x612.png"
                  fill
                />

                {/* Ranking Badge for Popular Posts */}
                {filter === 'popular' && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title */}
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-snug">
                  {post.title}
                </h4>
                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.categories
                      .slice(0, 2)
                      .map((category, categoryIndex) => (
                        <span
                          key={`${post.id}-category-${category.id}-${categoryIndex}`}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60"
                        >
                          {category.name}
                        </span>
                      ))}
                  </div>
                )}
                {/* Meta Information */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <SafeImage
                      alt={`${post.author.first_name} ${post.author.last_name}`}
                      className="w-4 h-4 rounded-full object-cover"
                      images={[
                        {
                          image_path: getPublicImageUrl(
                            'profiles',
                            post.author.id,
                            post.author.profile?.image_path
                          ),
                        },
                      ]}
                      width={20}
                      height={20}
                    />
                    <span className="truncate max-w-20">
                      {post.author.first_name}
                    </span>
                  </div>

                  {/* Separator */}
                  <span className="text-gray-300">•</span>

                  {/* Date */}
                  <time
                    className="text-xs text-gray-500"
                    dateTime={post.created_at}
                  >
                    {formatDate(post.created_at)}
                  </time>

                  {/* Views (if available) */}
                  {post.views !== undefined && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {post.views}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-4 h-4 text-gray-400"
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
            </Link>
          </article>
        ))}
      </div>

      {/* View All Link */}
      {posts.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-gray-50/30 to-gray-100/20 border-t border-gray-100/50">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group/link"
          >
            <span>View all posts</span>
            <svg
              className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostListSidebar;
