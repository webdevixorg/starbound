import React, { useEffect, useState } from 'react';
import { fetchPostsForSections } from '../../services/api'; // Ensure this path is correct
import { Post } from '../../types/types';
import { formatDate } from '../../helpers/common';
import { CategoryName } from '../../helpers/fetching';

const PostListSidebar: React.FC<{ filter: string; count: number }> = ({
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
    <div className="container mb-10">
      <div className="border-b flex justify-between items-end mb-6 pb-4">
        <h2 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">
          <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
          Recent Articles
        </h2>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group cursor-pointer flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6 mb-6"
          >
            {/* Image */}
            <div className="flex-shrink-0 w-24 h-20 sm:w-16 sm:h-12 lg:w-24 lg:h-20 border-gray-300">
              <a
                href={`/posts/${post.slug}`}
                className="block relative overflow-hidden w-full h-full"
              >
                <img
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform duration-500 ease-in-out transform hover:scale-110"
                  sizes="(max-width: 768px) 30vw, 33vw"
                  src={
                    post.images && post.images[0]?.image_path
                      ? post.images[0].image_path
                      : '/assets/image_placeholder.jpg'
                  }
                />
              </a>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="sidebar-item-categories">
                {post.categories && post.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {post.categories.map((category) => (
                      <span className="text-xs font-medium tracking-wider uppercase text-blue-600">
                        <CategoryName categoryId={category} />
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-medium tracking-wider uppercase text-gray-600">
                    No categories available
                  </span>
                )}
              </div>

              <h2 className="text-xs sm:text-sm md:text-base lg:text xl:text-lg mb-3 dark:text-white">
                <a
                  href={`/posts/${post.slug}`}
                  className="transition-all duration-500 hover:text-blue-600"
                >
                  {post.title}
                </a>
              </h2>

              <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                <a
                  href={post.author.first_name}
                  className="flex items-center gap-3"
                >
                  <img
                    alt={post.author.first_name}
                    className="h-6 w-6 rounded-full object-cover"
                    src={post.author.profile.image}
                  />
                  <span className="truncate text-sm">
                    {post.author.first_name}
                  </span>
                </a>

                <span className="text-xs text-gray-300 dark:text-gray-600">
                  •
                </span>

                <time
                  className="text-xs font-semibold text-gray-300 dark:text-gray-600"
                  dateTime={post.date}
                >
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

export default PostListSidebar;
