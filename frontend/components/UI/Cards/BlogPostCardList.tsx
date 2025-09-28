import React from 'react';
import Link from 'next/link';
import SafeImage from '@/components/UI/SafeImage';
import HtmlContent from '@/helpers/content';
import { getPublicImageUrl } from '@/helpers/media';
import { Post } from '@/types/types';

interface BlogPostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured';
  showExcerpt?: boolean;
  excerptLength?: number;
  className?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
  post,
  variant = 'default',
  showExcerpt = true,
}) => {
  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  };

  return (
    <article className={`group relative overflow-hidden rounded-2xl mb-10`}>
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex flex-row gap-6">
        {/* Image Section - Fixed Left Side */}
        <div className="relative flex-shrink-0">
          <Link
            href={`/posts/${post.slug}`}
            className="block relative w-48 md:w-60 lg:w-72 h-32 md:h-36 lg:h-40 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200"
          >
            {/* Image container with elegant styling */}
            <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out">
              <SafeImage
                alt={post.title}
                className="w-full h-full object-cover"
                images={[
                  {
                    image_path: getPublicImageUrl(
                      'posts',
                      post.id,
                      post.images?.[0]?.image_path
                    ),
                  },
                ]}
                fill
              />
              {/* Elegant overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Featured badge */}
            {variant === 'featured' && (
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-full shadow-lg">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col h-32 md:h-36 lg:h-40 p-2">
          {/* Main Content Area */}
          <div className="flex-1 space-y-2 overflow-hidden">
            {/* Categories */}
            <div className="flex flex-wrap gap-1">
              {post.categories?.slice(0, 2).map((category, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200/60"
                >
                  {category.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <div>
              <Link href={`/posts/${post.slug}`} className="group/title">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover/title:text-blue-600 transition-colors duration-300 leading-tight">
                  {post.title}
                </h3>
              </Link>
            </div>

            {/* Excerpt */}
            {showExcerpt && (
              <div className="text-sm text-gray-600 line-clamp-2 leading-tight">
                <HtmlContent
                  htmlContent={truncateText(post.description || '', 150)}
                />
              </div>
            )}
          </div>

          {/* Meta Information - Fixed at Bottom */}
          <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100/50">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {post.created_at && (
                <span className="flex items-center gap-1">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              )}

              {post.views !== undefined && (
                <span className="flex items-center gap-1">
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {post.views} views
                </span>
              )}
            </div>

            {/* Read more link */}
            <Link
              href={`/posts/${post.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group/link"
            >
              <span>Read more</span>
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
        </div>
      </div>
    </article>
  );
};

export default BlogPostCard;
