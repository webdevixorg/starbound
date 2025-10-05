'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicImageUrl } from '@/helpers/media';
import { formatDate } from '@/helpers/common';
import HtmlContent from '@/helpers/content';
import SafeImage from '@/components/UI/SafeImage';

import { useAuth } from '@/context/AuthContext';

import { fetchPostBySlug } from '@/services/api';
import { Post } from '@/types/types';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import PostListSidebar from '@/components/PageComponents/PostListSidebar';
import ProductListSidebar from '@/components/PageComponents/ProductListSidebar';

const SinglePost: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const getPost = async () => {
      try {
        if (slug) {
          const fetchedPost = await fetchPostBySlug('post', slug);
          setPost(fetchedPost);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    getPost();
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          {/* Breadcrumbs Skeleton */}
          <div className="mb-8">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Skeleton */}
            <article className="flex-1">
              {/* Header Card Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
                {/* Hero Image Skeleton */}
                <div className="aspect-[16/9] w-full bg-gray-200"></div>

                {/* Content Skeleton */}
                <div className="p-8">
                  {/* Title Skeleton */}
                  <div className="space-y-3 mb-6">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>

                  {/* Author and Metadata Skeleton */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
                <div className="p-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>

              {/* Author Section Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar Skeleton */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-8 space-y-6">
                {/* Products Sidebar Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Posts Sidebar Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter Skeleton */}
                <div className="bg-blue-600 rounded-2xl p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl mx-auto mb-4"></div>
                    <div className="h-6 bg-white/20 rounded w-32 mx-auto mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-48 mx-auto mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-10 bg-white/20 rounded"></div>
                      <div className="h-10 bg-white rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <BreadcrumbsComponent post={post} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1">
            {/* Header Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 overflow-hidden mb-8">
              {/* Hero Image */}
              <div className="aspect-[16/9] w-full relative overflow-hidden">
                <SafeImage
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  images={[
                    {
                      image_path: getPublicImageUrl(
                        'posts',
                        post.id,
                        post.images?.[0]?.image_path + '_full.webp'
                      ),
                    },
                  ]}
                  fallback="/images/placeholders/612x612.png"
                  fill
                />
                {/* Gradient overlay for title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Categories badges */}
                {post.categories && post.categories.length > 0 && (
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {post.categories.slice(0, 3).map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600/90 text-white text-xs font-medium rounded-full backdrop-blur-sm"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Overlay */}
              <div className="p-8">
                {/* Title */}
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Author and Metadata */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <SafeImage
                        alt={
                          post.author.first_name + ' ' + post.author.last_name
                        }
                        className="rounded-full h-12 w-12 object-cover ring-2 ring-blue-100"
                        images={[
                          {
                            image_path: getPublicImageUrl(
                              'profiles',
                              post.author.id,
                              post.author.profile.image_path
                            ),
                          },
                        ]}
                        width={48}
                        height={48}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {post.author.first_name} {post.author.last_name}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 space-x-3">
                        <time dateTime={post.created_at}>
                          {formatDate(post.created_at)}
                        </time>
                        <span>•</span>
                        <span>6 min read</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {isAuthenticated && (
                      <Link
                        href={`/profile/posts/add-post?slug=${post.slug}`}
                        className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 hover:text-white transition-all duration-300 text-sm font-medium shadow shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/5"
                      >
                        <svg
                          className="w-4 h-4 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <span className="relative">Edit Post</span>
                      </Link>
                    )}
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 overflow-hidden mb-8">
              <div className="p-8">
                <div className="prose prose-lg prose-blue max-w-none">
                  <HtmlContent htmlContent={post.description} />
                </div>
              </div>
            </div>

            {/* About the Author */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 overflow-hidden mb-8">
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <SafeImage
                      alt={post.author.first_name + ' ' + post.author.last_name}
                      className="rounded-2xl h-24 w-24 object-cover ring-4 ring-blue-100"
                      images={[
                        {
                          image_path: getPublicImageUrl(
                            'profiles',
                            post.author.id,
                            post.author.profile.image_path
                          ),
                        },
                      ]}
                      width={96}
                      height={96}
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {post.author.first_name} {post.author.last_name}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {post.author.profile.bio ||
                        'A passionate writer and expert in automotive industry, sharing insights and knowledge with our community.'}
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-blue-500/25"
                      >
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        View Profile
                      </Link>
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <Link
                    href="/posts"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium"
                  >
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    All Posts
                  </Link>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Share this article
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Products Sidebar */}
              <ProductListSidebar filter="latest" count={4} />

              {/* Related Posts Sidebar */}
              <PostListSidebar filter="latest" count={4} />

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl overflow-hidden">
                <div className="p-6 text-white">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                    <p className="text-blue-100 mb-4 text-sm">
                      Get the latest automotive news and insights delivered to
                      your inbox.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                      />
                      <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium">
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SinglePost;
