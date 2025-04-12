import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Splide, SplideSlide } from '@splidejs/react-splide';

import { fetchPostsForSections } from '../../services/api';
import { Post } from '../../types/types';
import { CategoryName } from '../../helpers/fetching';

const SliderNews: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPostsForSections(filter, count);
        setPosts(data.results);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${filter} news:`, err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]);
      }
    };

    loadPosts();
  }, [filter, count]);

  return (
    <div
      className="relative bg-gray-50"
      style={{
        backgroundImage: "url('/images/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="bg-black bg-opacity-70">
        <div className="container mx-auto px-5 py-5 lg:py-8">
          <div className="w-full py-3">
            <h2 className="text-white text-2xl font-bold text-shadow-black">
              <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
              Latest News
            </h2>
          </div>

          {error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <Splide
              options={{
                type: 'loop',
                perPage: 3,
                gap: '1rem',
                autoplay: true,
              }}
            >
              {posts.map((post) => (
                <SplideSlide key={post.id}>
                  <div className="w-full pb-10">
                    <div className="hover-img bg-white">
                      <Link to={`/posts/${post.slug}`}>
                        <div className="relative w-full h-64 overflow-hidden">
                          <img
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            src={
                              post.images?.[0]?.image_path ||
                              '/assets/image_placeholder.jpg'
                            }
                          />
                        </div>
                      </Link>
                      <div className="py-3 px-6">
                        <h3 className="text-lg font-semibold leading-snug tracking-tight mt-2 dark:text-white">
                          <Link to={`/posts/${post.slug}`}>
                            <span className="bg-gradient-to-r from-blue-200 to-blue-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] dark:from-purple-800 dark:to-purple-900">
                              {post.title}
                            </span>
                          </Link>
                        </h3>
                        <div className="text-gray-600 dark:text-gray-400 mb-4">
                          <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
                          {post.categories?.length ? (
                            post.categories.map((category) => (
                              <span
                                key={String(category)}
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
                      </div>
                    </div>
                  </div>
                </SplideSlide>
              ))}
            </Splide>
          )}
        </div>
      </div>
    </div>
  );
};

export default SliderNews;
