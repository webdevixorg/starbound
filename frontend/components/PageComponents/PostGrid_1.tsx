'use client';
import React, { useEffect, useState } from 'react';

import SafeImage from '../UI/SafeImage';
import HtmlContent from '@/helpers/content';

import { formatDate } from '@/helpers/common';
import { CategoryName } from '@/helpers/fetching';
import { getPublicImageUrl } from '@/helpers/media';

import { fetchPostsByCategory } from '@/services/api';
import { Post } from '@/types/types';

const PostGrid_1: React.FC<{
  categoryId: number;
  count: number;
  title?: string;
}> = ({ categoryId, count, title = 'Post List' }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPostsByCategory(categoryId, count);
        setPosts(data.results);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    loadPosts();
  }, [categoryId]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="border-b flex justify-between items-end mb-8 pb-6">
        <h2 className="text-gray-800 text-4xl">
          <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
          {title}
        </h2>
      </div>

      <div className="grid gap-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
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
                    className="h-full w-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-110"
                    sizes="(max-width: 768px) 30vw, 33vw"
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
                    width={400} // or your preferred width
                    height={300} // or your preferred height
                    priority
                  />
                </div>
              </a>
            </div>
            <div>
              <div className="flex gap-3">
                {post.categories && post.categories.length > 0 ? (
                  post.categories.map((category, index) => (
                    <span
                      key={`${post.id}-category-${category}-${index}`}
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
              <div className="flex">
                <a href={`/posts/${post.slug}`}>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                    <HtmlContent htmlContent={post.description} />
                  </p>
                </a>
              </div>
              <div className="mt-3 flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                <a href={`/authors/${post.author.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-5 w-5 flex-shrink-0">
                      <SafeImage
                        alt={
                          post.author.first_name + ' ' + post.author.last_name
                        }
                        className="rounded-full h-5 w-5 object-cover mb-6 mr-6"
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
                    </div>
                    <span className="truncate text-sm">
                      {post.author.first_name}
                    </span>
                  </div>
                </a>
                <span className="text-xs text-gray-300 dark:text-gray-600">
                  •
                </span>
                <time className="truncate text-sm" dateTime={post.created_at}>
                  {formatDate(post.created_at)}
                </time>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostGrid_1;
