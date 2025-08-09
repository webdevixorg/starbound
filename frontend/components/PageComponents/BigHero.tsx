'use client';

import React, { useEffect, useState } from 'react';
import SafeImage from '../UI/SafeImage';
import { fetchPostsForSections } from '@/services/api';
import { Post } from '@/types/types';
import { CategoryName } from '@/helpers/fetching';
import LoadingSpinner from '@/components/Common/Loading';
import { getPublicImageUrl } from '@/helpers/media';

const HeroBigGrid: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPostsForSections(filter, count);
        setPosts(data.results.slice(0, count));
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    loadPosts();
  }, [filter, count]);

  if (!posts.length) return <LoadingSpinner />;

  const renderCategories = (post: Post) =>
    post.categories && post.categories.length > 0 ? (
      post.categories.map((category, index) => (
        <span
          key={`${post.id}-category-${category}-${index}`}
          className="inline-block text-xs font-medium tracking-wider uppercase text-white mr-2"
        >
          <CategoryName categoryId={category} />
        </span>
      ))
    ) : (
      <span className="text-xs font-medium tracking-wider uppercase text-gray-300">
        No categories
      </span>
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="grid gap-5 md:grid-cols-2 lg:gap-5">
        {/* Left Big Image */}
        <a
          href={`posts/${posts[0].slug}`}
          className="group relative block overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <SafeImage
            alt={posts[0].title}
            className="w-full h-full object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            fill
            images={[
              {
                image_path: getPublicImageUrl(
                  'posts',
                  posts[0].id,
                  posts[0].images?.[0]?.image_path
                ),
              },
            ]}
          />
          <div className="absolute bottom-0 w-full px-5 pt-8 pb-5 bg-gradient-cover">
            <h2 className="text-xl font-bold capitalize text-white mb-3">
              {posts[0].title}
            </h2>
            <p
              className="text-gray-100 hidden sm:block"
              dangerouslySetInnerHTML={{ __html: posts[0].description }}
            ></p>
            <div className="pt-3">
              <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
              {renderCategories(posts[0])}
            </div>
          </div>
        </a>

        {/* Right Grid of Smaller Posts */}
        <div className="relative h-[500px] grid grid-cols-2 gap-3 lg:gap-4">
          {posts.slice(1, count).map((post) => (
            <a
              key={post.id}
              href={`posts/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <div className="relative h-full w-full">
                <SafeImage
                  alt={post.title}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  fill
                  images={[
                    {
                      image_path: getPublicImageUrl(
                        'posts',
                        post.id,
                        post.images?.[0]?.image_path || ''
                      ),
                    },
                  ]}
                />
                <div className="absolute bottom-0 w-full px-4 pt-6 pb-4 bg-gradient-cover">
                  <h2 className="text-sm font-semibold capitalize text-white mb-1 leading-tight">
                    {post.title}
                  </h2>
                  <div className="pt-1">
                    <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
                    {renderCategories(post)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBigGrid;
