import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

import { fetchPostBySlug } from '../services/api';
import { Post } from '../types/types';
import { formatDate } from '../helpers/common';
import HtmlContent from '../helpers/content';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';
import PostListSidebar from '../components/PageComponents/PostListSidebar';
import ProductListSidebar from '../components/PageComponents/ProductListSidebar';

const SinglePost: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Use useAuth hook to get the current user

  const { slug } = useParams<{ slug: string }>();
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
    return <div className="text-center py-20">Loading...</div>;
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
              <img
                alt={post.author.first_name}
                className="rounded-full h-10 w-10 object-cover"
                src={post.author.profile.image}
              />
              <p className="font-semibold">
                {post.author.first_name} {post.author.last_name}
              </p>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span> · 6 min read</span>
              {isAuthenticated && (
                <a
                  href={`/posts/${post.slug}/edit`}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </a>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="mx-auto px-4 max-w-full">
            <img
              alt={post.title}
              className="inline-block mb-2 w-full mx-auto" // Added Tailwind's max-width and center alignment classes
              src={
                post.images && post.images[0]
                  ? post.images[0].image_path
                  : '/assets/image_placeholder.jpg'
              }
              style={{ objectFit: 'cover' }}
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
              <img
                alt={post.author.first_name}
                className="rounded-full h-20 w-20 object-cover mb-6 mr-6"
                src={post.author.profile.image}
              />
              <div>
                <h3 className="text-lg font-semibold">
                  About {post.author.first_name} {post.author.last_name}
                </h3>
                <p className="mt-2">{post.author.profile.bio}</p>
                <Link
                  to="/profile"
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
              to="/"
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
