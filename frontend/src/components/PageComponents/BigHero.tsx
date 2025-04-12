import React, { useEffect, useState } from 'react';
import { fetchPostsForSections } from '../../services/api'; // Ensure this path is correct
import { Post } from '../../types/types';
import { CategoryName } from '../../helpers/fetching';

const HeroBigGrid: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPostsForSections(filter, count);
        setPosts(data.results.slice(0, count)); // Limit the posts to the desired count
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    loadPosts();
  }, [filter, count]); // Include dependencies for filter and count

  if (posts.length === 0) {
    return <div>Loading...</div>; // You can replace this with a proper loading indicator
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="xl:container mx-auto xs:px-4">
        {/* Big Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:gap-5">
          {/* Start left cover */}
          <div className="group cursor-pointer">
            <div className="relative gradient-overlay overflow-hidden bg-gray-100 transition-all dark:bg-gray-800 h-full">
              <a href={`posts/${posts[0].slug}`}>
                <div className="h-full">
                  <img
                    alt={posts[0].title}
                    className="w-full h-full object-cover rounded-lg"
                    sizes="(max-width: 768px) 30vw, 33vw"
                    src={
                      posts[0].images && posts[0].images[0]?.image_path
                        ? posts[0].images[0].image_path
                        : '/assets/image_placeholder.jpg'
                    }
                  />
                </div>
              </a>
              <div className="absolute px-5 pt-8 pb-5 bottom-0 w-full bg-gradient-cover">
                <a href={`posts/${posts[0].slug}`}>
                  <h2 className="text-xl font-bold capitalize text-white mb-3">
                    {posts[0].title}
                  </h2>
                  <p
                    className="text-gray-100 hidden sm:inline-block"
                    dangerouslySetInnerHTML={{ __html: posts[0].description }}
                  ></p>
                </a>
                <div className="pt-2">
                  <div className="text-gray-600 dark:text-gray-400 mb-4">
                    <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
                    {posts[0].categories && posts[0].categories.length > 0 ? (
                      posts[0].categories.map((category) => (
                        <span className="inline-block text-xs font-medium tracking-wider uppercase text-white">
                          <CategoryName categoryId={category} />
                        </span>
                      ))
                    ) : (
                      <span className="inline-block text-xs font-medium tracking-wider uppercase text-gray-600">
                        No categories available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start box news */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:gap-4">
            {posts.slice(1, count).map((post) => (
              <div key={post.id} className="group cursor-pointer flex flex-col">
                <div className="relative overflow-hidden bg-gray-100 transition-all dark:bg-gray-800 flex-1">
                  <a href={`posts/${post.slug}`}>
                    <div className="h-full">
                      <img
                        alt={post.title}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 30vw, 33vw"
                        src={
                          post.images && post.images[0]?.image_path
                            ? post.images[0].image_path
                            : '/assets/image_placeholder.jpg'
                        }
                      />
                    </div>
                  </a>
                  <div className="absolute px-4 pt-7 pb-4 bottom-0 w-full bg-gradient-cover">
                    <a href={`posts/${post.slug}`}>
                      <h2 className="text-sm font-semibold capitalize leading-tight text-white mb-1">
                        {post.title}
                      </h2>
                    </a>
                    <div className="pt-1">
                      <div className="text-gray-600 dark:text-gray-400 mb-4">
                        <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
                        {post.categories && post.categories.length > 0 ? (
                          post.categories.map((category) => (
                            <span className="inline-block text-xs font-medium tracking-wider uppercase text-white">
                              <CategoryName categoryId={category} />
                            </span>
                          ))
                        ) : (
                          <span className="inline-block text-xs font-medium tracking-wider uppercase text-gray-600">
                            No categories available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBigGrid;
