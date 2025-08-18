import React from 'react';
import SafeImage from '@/components/UI/SafeImage';
import HtmlContent from '@/helpers/content';
import { getPublicImageUrl } from '@/helpers/media';
import { formatDate } from '@/helpers/common';
import { Post } from '@/types/types';
import { CategoryName } from '@/helpers/fetching';

interface BlogPostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured';
  showExcerpt?: boolean;
  excerptLength?: number;
  className?: string;
}

const BlogPostCardDefault: React.FC<BlogPostCardProps> = ({
  post,
  variant = 'default',
  showExcerpt = true,
  excerptLength = 75,
}) => {
  return (
    <div key={post.id} className="group cursor-pointer">
      <div className="overflow-hidden rounded-md bg-gray-100 transition-all dark:bg-gray-800">
        <a
          className="relative block"
          href={`/posts/${post.slug}`}
          style={{ height: '300px' }} // Set a fixed height for the container
        >
          <div className="overflow-hidden h-full w-full">
            <SafeImage
              alt={post.title}
              className="object-cover absolute inset-0 m-0 w-full h-full"
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
          </div>
        </a>
      </div>
      <div>
        <div className="flex gap-3">
          {post.categories && post.categories.length > 0 ? (
            post.categories.map((category, index) => (
              <span
                key={`category-${index}`}
                className="inline-block text-xs font-medium tracking-wider uppercase mt-5 text-blue-600"
              >
                <CategoryName categoryId={category} />
              </span>
            ))
          ) : (
            <span className="inline-block text-xs font-medium tracking-wider uppercase mt-5 text-gray-600">
              No categories available
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold leading-snug tracking-tight mt-2 dark:text-white">
          <a href={`/posts/${post.slug}`}>
            <span className="bg-gradient-to-r from-blue-200 to-blue-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px] dark:from-purple-800 dark:to-purple-900">
              {post.title}
            </span>
          </a>
        </h2>
        {/* Excerpt */}
        {showExcerpt && post.description && (
          <div
            className={`leading-6 text-gray-600 ${
              variant === 'featured' ? 'text-base mt-3' : 'text-sm mt-2'
            }`}
          >
            <HtmlContent
              htmlContent={post.description}
              maxLength={excerptLength}
              showReadMore={false}
            />
          </div>
        )}
        <div className="mt-3 flex items-center space-x-3 text-gray-500 dark:text-gray-400">
          <a href={post.author.first_name}>
            <div className="flex items-center gap-3">
              <div className="relative h-5 w-5 flex-shrink-0">
                <SafeImage
                  alt={post.title}
                  className="object-cover absolute inset-0 m-0 w-full h-full"
                  images={[
                    {
                      image_path: getPublicImageUrl(
                        'profiles',
                        post.author.id,
                        post.author.profile.image_path
                      ),
                    },
                  ]}
                  fill
                />
              </div>
              <span className="truncate text-sm">{post.author.first_name}</span>
            </div>
          </a>
          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
          <time className="truncate text-sm" dateTime={post.created_at}>
            {formatDate(post.created_at)}
          </time>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCardDefault;
