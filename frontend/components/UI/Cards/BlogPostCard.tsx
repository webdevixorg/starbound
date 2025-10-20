import React from 'react';
import SafeImage from '@/components/UI/SafeImage';
import HtmlContent from '@/helpers/content';
import { getPublicImageUrl } from '@/helpers/media';
import { formatDate } from '@/helpers/common';
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
  excerptLength = 75,
  className = '',
}) => {
  const cardClasses = {
    default:
      'relative isolate flex max-w-2xl flex-col gap-x-8 gap-y-6 sm:flex-row sm:items-start lg:flex-col lg:items-stretch',
    compact: 'relative isolate flex flex-col gap-y-4',
    featured: 'relative isolate flex max-w-2xl flex-col gap-y-6',
  };

  const imageClasses = {
    default:
      'aspect-[2/1] w-full rounded-xl bg-gray-100 sm:aspect-[16/9] sm:h-32 lg:h-auto z-0',
    compact: 'aspect-[16/9] w-full rounded-lg bg-gray-100 z-0',
    featured: 'aspect-[2/1] w-full rounded-xl bg-gray-100 z-0',
  };

  return (
    <article className={`${cardClasses[variant]} ${className}`}>
      {/* Image Section */}
      <div className="relative flex-none">
        <div className={imageClasses[variant]}>
          <a
            href={`/posts/${post.slug}`}
            className="block relative overflow-hidden w-full h-full rounded"
          >
            <SafeImage
              alt={post.title}
              className="object-cover absolute inset-0 w-full h-full"
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
          </a>
        </div>
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
      </div>

      {/* Content Section */}
      <div className="flex-1">
        {/* Meta Information */}
        <div className="flex items-center gap-x-4 mb-2">
          <time
            dateTime={post.created_at}
            className="text-sm leading-6 text-gray-600"
          >
            {formatDate(post.created_at)}
          </time>

          {/* Category Badge */}
          {post.categories && post.categories.length > 0 && (
            <a
              className="relative z-10 rounded-full bg-gray-50 py-1.5 px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              href={`/categories/${post.categories[0].slug}`}
            >
              {post.categories[0].name}
            </a>
          )}
        </div>

        {/* Title */}
        <h4
          className={`font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors ${
            variant === 'featured' ? 'text-lg mt-3' : 'text-sm mt-2'
          }`}
        >
          <a href={`/posts/${post.slug}`}>
            <span className="absolute inset-0"></span>
            {post.title}
          </a>
        </h4>

        {/* Excerpt */}
        {showExcerpt && post.description && (
          <p
            className={`leading-6 text-gray-600 ${
              variant === 'featured' ? 'text-base mt-3' : 'text-sm mt-2'
            }`}
          >
            <HtmlContent
              htmlContent={post.description}
              maxLength={excerptLength}
              showReadMore={false}
            />
          </p>
        )}
      </div>
    </article>
  );
};

export default BlogPostCard;
