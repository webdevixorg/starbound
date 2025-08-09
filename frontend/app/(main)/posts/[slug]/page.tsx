'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicImageUrl } from '@/helpers/media';
import { formatDate } from '@/helpers/common';
import HtmlContent from '@/helpers/content';
import SafeImage from '@/components/UI/SafeImage';
import LoadingSpinner from '@/components/Common/Loading'; // Spinner shown during loading

import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook

import { fetchPostBySlug } from '@/services/api';
import { Post } from '@/types/types';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';
import PostListSidebar from '@/components/PageComponents/PostListSidebar';
import ProductListSidebar from '@/components/PageComponents/ProductListSidebar';

const SinglePost: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Use useAuth hook to get the current user

  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const getPost = async () => {
      try {
        if (slug) {
          const fetchedPost = await fetchPostBySlug(slug);
          setPost(fetchedPost);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    getPost();
  }, [slug]);

  if (!post) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto px-4 mt-6 max-w-full">
        <BreadcrumbsComponent post={post} />
      </div>
      {/* Header Section */}

      <div className="mx-auto max-w-full flex flex-wrap">
        <div className="w-full sm:w-2/3 md:w-3/4 lg:w-2/3">
          {/* Title */}
          <div className="mx-auto px-4 mt-6 max-w-full">
            <h1 className="font-normal text-gray-900 dark:text-gray-100 mb-6 mt-6 text-left text-4xl leading-tight font-gliko">
              {post.title}
            </h1>
          </div>

          {/* Author and Metadata */}
          <div className="mx-auto px-4 mb-8 max-w-full">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-3">
              <SafeImage
                alt={post.author.first_name + ' ' + post.author.last_name}
                className="relative rounded-full h-10 w-10 object-cover"
                images={[
                  {
                    image_path: getPublicImageUrl(
                      'profiles',
                      post.author.id,
                      post.author.profile.image_path
                    ),
                  },
                ]}
                width={400}
                height={400}
              />
              <p className="font-semibold">
                {post.author.first_name} {post.author.last_name}
              </p>
              <time dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
              <span> · 6 min read</span>
              {isAuthenticated && (
                <a
                  href={`/profile/posts/add-post?slug=${post.slug}`}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </a>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="mx-auto px-4 max-w-full">
            <SafeImage
              alt={post.title}
              className="inline-block mb-2 w-full mx-auto" // Added Tailwind's max-width and center alignment classes
              images={[
                {
                  image_path: getPublicImageUrl(
                    'posts',
                    post.id,
                    post.images?.[0]?.image_path
                  ),
                },
              ]}
              fallback="/images/placeholders/612x612.png"
              width={500}
              height={150}
            />
          </div>

          {/* Article Box */}
          <div className="mx-auto px-4 mb-10 max-w-full bg-white p-6">
            <article className="prose prose-lg dark:prose-invert max-w-full">
              <HtmlContent htmlContent={post.description} />
            </article>
          </div>

          {/* About the Author */}
          <div className="mx-auto px-4 mt-16 max-w-full">
            <div className="mb-6 flex items-start">
              <SafeImage
                alt={post.author.first_name + ' ' + post.author.last_name}
                className="rounded-full h-20 w-20 object-cover mb-6 mr-6"
                images={[
                  {
                    image_path: getPublicImageUrl(
                      'profiles',
                      post.author.id,
                      post.author.profile.image_path
                    ),
                  },
                ]}
                width={400}
                height={200}
              />
              <div>
                <h3 className="text-lg font-semibold">
                  About {post.author.first_name} {post.author.last_name}
                </h3>
                <p className="mt-2">{post.author.profile.bio}</p>
                <Link
                  href="/profile"
                  className="text-blue-600 dark:text-blue-400 inline-block"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Posts */}
          <div className="mx-auto px-4 mt-10 text-center max-w-full">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-500"
            >
              ← View all posts
            </Link>
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-full sm:w-1/3 md:w-1/4 lg:w-1/3 p-4">
          <ProductListSidebar filter="latest" count={4} />
          <PostListSidebar filter="latest" count={4} />
        </div>
      </div>
    </div>
  );
};

export default SinglePost;
