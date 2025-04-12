import React, { useEffect, useState } from 'react';
import { fetchPostsForSections } from '../../services/api'; // Ensure this path is correct
import { Post } from '../../types/types';
import { formatDate } from '../../helpers/common';
import { CategoryName } from '../../helpers/fetching';

const PostGrid_1: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPostsForSections(filter, count);
        setPosts(data.results);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    loadPosts();
  }, [filter]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="border-b flex justify-between items-end mb-8 pb-6">
        <h2 className="text-gray-800 text-4xl">
          <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
          Entertainment News
        </h2>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-10">
        {posts.map((post) => (
          <div key={post.id} className="group cursor-pointer">
            <div className="overflow-hidden rounded-md bg-gray-100 transition-all dark:bg-gray-800">
              <a
                className="relative block"
                href={`/posts/${post.slug}`}
                style={{ height: '300px' }} // Set a fixed height for the container
              >
                <div className="overflow-hidden h-full w-full">
                  <img
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-110" // Ensure image covers the container and scales on hover
                    sizes="(max-width: 768px) 30vw, 33vw"
                    src={
                      post.images && post.images[0]?.image_path
                        ? post.images[0].image_path
                        : '/assets/image_placeholder.jpg'
                    }
                  />
                </div>
              </a>
            </div>
            <div>
              <div className="flex gap-3">
                {post.categories && post.categories.length > 0 ? (
                  post.categories.map((category) => (
                    <span className="inline-block text-xs font-medium tracking-wider uppercase mt-5 text-blue-600">
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
                    <span
                      dangerouslySetInnerHTML={{ __html: post.description }}
                    />
                  </p>
                </a>
              </div>
              <div className="mt-3 flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                <a href={post.author.first_name}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-5 w-5 flex-shrink-0">
                      <img
                        alt={post.author.first_name}
                        className="rounded-full object-cover"
                        sizes="20px"
                        src={post.author.profile.image}
                        style={{
                          position: 'absolute',
                          height: '100%',
                          width: '100%',
                          inset: '0px',
                          color: 'transparent',
                        }}
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
                <time className="truncate text-sm" dateTime={post.date}>
                  {formatDate(post.date)}
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
