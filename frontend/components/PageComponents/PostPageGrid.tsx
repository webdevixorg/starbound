'use client';

import React, { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { fetchPostsForSections } from '@/services/api'; // Ensure this path is correct
import { Post } from '@/types/types';
import { CategoryName } from '@/helpers/fetching';
import Link from 'next/link';
import HtmlContent from '@/helpers/content';
import { getPublicImageUrl } from '@/helpers/media';
import SafeImage from '../UI/SafeImage';

const LatestNews: React.FC<{
  filter: string;
  count: number;
}> = ({ filter, count }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPostsForSections(filter, count);
        setPosts(data.results);
      } catch (error) {
        console.error(`Error fetching ${filter} news:`, error);
      }
    };

    loadPosts();
  }, [filter, count]);

  const popularPosts = posts
    .filter(
      (post) =>
        post.categories &&
        post.categories.length > 0 &&
        post.categories[0].slug === 'web-development'
    )
    .map((news) => news);

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8">
      <div className="flex flex-row flex-wrap">
        <div className="flex-shrink max-w-full w-full lg:w-2/3 order-first lg:pr-8 lg:pb-8">
          <div className="flex flex-row flex-wrap">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group cursor-pointer w-full px-3 mb-8"
              >
                <div
                  key={post.id}
                  className="flex flex-col sm:flex-row max-w-full w-full pb-3 pt-3 sm:pt-0 border-b-2 sm:border-b-0 border-dotted border-gray-100"
                >
                  <div
                    className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                    style={{ height: '250px', width: '300px' }} // Set a fixed height and width for consistency
                  >
                    <a
                      href={`posts/${post.slug}`}
                      className="h-full w-full block"
                    >
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
                      />
                    </a>
                  </div>
                  <div className="flex-grow sm:pl-6 sm:mt-0">
                    <div className="text-gray-600 dark:text-gray-400 mb-4">
                      {post.categories && post.categories.length > 0 ? (
                        post.categories.map((category, index) => (
                          <span
                            key={`${post.id}-category-${category}-${index}`}
                            className="inline-block text-xs font-medium tracking-wider uppercase text-blue-600"
                          >
                            <CategoryName categoryId={category} />
                          </span>
                        ))
                      ) : (
                        <span className="inline-block text-xs font-medium tracking-wider uppercase text-gray-600">
                          No categories available
                        </span>
                      )}
                    </div>
                    <Link href={`/posts/${post.slug}`}>
                      <h2 className="text-2xl font-bold capitalize text-gray-800 dark:text-white mb-3">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                      <HtmlContent htmlContent={post.description} />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-shrink max-w-full w-full lg:w-1/3">
          <div className="w-full bg-white mb-6">
            <div className="p-4 bg-gray-100">
              <h2 className="text-lg font-bold">Most Popular</h2>
            </div>
            <ul className="post-number">
              {popularPosts.map((post, index) => (
                <li
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <a
                    className="text-sm font-semibold px-6 py-3 flex flex-row items-center"
                    href={`posts/${post.slug}`}
                  >
                    {post.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm sticky">
            <div className="w-full text-center">
              <a href="#">
                <NextImage
                  className="mx-auto w-full"
                  src="/images/ads/250.jpg"
                  alt="advertisement area"
                  width={250}
                  height={200}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestNews;
