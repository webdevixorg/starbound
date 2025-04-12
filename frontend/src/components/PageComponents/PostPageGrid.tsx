import React, { useEffect, useState, useMemo } from 'react';
import { useContent } from '../../context/ContentContext'; // useContent hook
import { fetchPosts } from '../../services/api';
import { Post } from '../../types/types';
import { formatDate } from '../../helpers/common';
import PaginationControls from '../Navigation/Pagination';

const PostPageGrid: React.FC<{ filter: string }> = ({ filter }) => {
  const { contentTypes, loading: contentLoading } = useContent(); // Get contentTypes from context
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [contentTypeId] = useState<number>(14);
  const [status] = useState<string>('Published');

  // Memoize matchedContentType to avoid recalculating on each render
  const matchedContentType = useMemo(() => {
    if (Array.isArray(contentTypes)) {
      return contentTypes.find(
        (contentType: any) => contentType.id === contentTypeId
      );
    }
    return null;
  }, [contentTypes, contentTypeId]);

  useEffect(() => {
    if (contentLoading || !matchedContentType) return; // Skip if contentTypes or matchedContentType is not ready

    const loadPosts = async () => {
      setLoading(true); // Start loading

      try {
        const { results, count, next, previous } = await fetchPosts(
          page,
          pageSize,
          status,
          filter,
          matchedContentType.model
        );

        setPosts(results);
        setTotalPosts(count);
        setNext(next);
        setPrevious(previous);
      } catch (error) {
        setError('Error fetching posts');
      } finally {
        setLoading(false); // End loading after API call
      }
    };

    loadPosts();
  }, [matchedContentType, filter, page, pageSize, status]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (posts.length === 0) return <div>No posts available</div>;

  return (
    <div className="container mx-auto xs:px-5 py-5 lg:py-8">
      <div className="w-full my-6">
        <h2 className="text-gray-800 text-2xl font-bold">
          <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
          Trending
        </h2>
      </div>
      <div className="grid gap-10 md:grid-cols-3 lg:gap-10">
        {posts.map((post) => (
          <div key={post.id} className="group cursor-pointer">
            <div className="overflow-hidden rounded-md bg-gray-100 transition-all hover:scale-105 dark:bg-gray-800">
              <a
                className="relative block aspect-video"
                href={`/posts/${post.slug}`}
              >
                <img
                  alt={post.title}
                  className="object-cover transition-all"
                  sizes="(max-width: 768px) 30vw, 33vw"
                  src={
                    post.images && post.images[0]
                      ? post.images[0].image_path
                      : '/assets/image_placeholder.jpg'
                  }
                  style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    inset: '0px',
                    color: 'transparent',
                  }}
                />
              </a>
            </div>
            <div>
              <div className="flex gap-3">
                {post.categories && post.categories.length > 0 ? (
                  <a href={`/category/${post.categories[0].slug}`}>
                    <span className="inline-block text-xs font-medium tracking-wider uppercase mt-5 text-blue-600">
                      {post.categories[0].name}
                    </span>
                  </a>
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
      <PaginationControls
        page={page}
        totalPosts={totalPosts}
        pageSize={pageSize}
        next={next}
        previous={previous}
        setPage={setPage}
      />
    </div>
  );
};

export default PostPageGrid;
