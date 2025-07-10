import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useContent } from '../../context/ContentContext';
import { fetchPosts } from '../../services/api';
import { Post } from '../../types/types';
import { formatDate } from '../../helpers/common';
import PaginationControls from '../Navigation/Pagination';

const useForumPosts = (
  filter: string,
  page: number,
  pageSize: number,
  contentTypeId: number,
  status: string
) => {
  const { contentTypes, loading: contentLoading } = useContent();
  const [state, setState] = useState<{
    posts: Post[];
    total: number;
    next: string | null;
    previous: string | null;
    loading: boolean;
    error: string | null;
  }>({
    posts: [],
    total: 0,
    next: null,
    previous: null,
    loading: true,
    error: null,
  });

  const matchedType = useMemo(
    () => {
      if (Array.isArray(contentTypes)) {
        return contentTypes.find((ct: any) => ct.id === contentTypeId);
      }
      // If contentTypes is an object, convert to array and find
      if (contentTypes && typeof contentTypes === 'object') {
        return Object.values(contentTypes).find(
          (ct: any) => ct.id === contentTypeId
        );
      }
      return undefined;
    },
    [contentTypes, contentTypeId]
  );

  const load = useCallback(async () => {
    if (contentLoading || !matchedType) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { results, count, next, previous } = await fetchPosts(
        page,
        pageSize,
        status,
        filter,
        matchedType.model
      );
      setState({
        posts: results,
        total: count,
        next,
        previous,
        loading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load posts',
      }));
    }
  }, [page, pageSize, status, filter, matchedType, contentLoading]);

  useEffect(() => {
    load();
  }, [load]);

  return state;
};

const PostPageGrid: React.FC<{ filter: string }> = ({ filter }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const contentTypeId = 14;
  const status = 'Published';

  const { posts, total, next, previous, loading, error } = useForumPosts(
    filter,
    page,
    pageSize,
    contentTypeId,
    status
  );

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">Loading posts...</div>
    );
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!posts.length)
    return (
      <div className="p-6 text-center text-gray-500">No posts available.</div>
    );

  return (
    <section className="relative bg-gray-50 h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex space-x-4"
          >
            <img
              src={post.author.profile.image}
              alt={post.author.first_name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <header className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {post.author.first_name} {post.author.last_name}
                  </h3>
                  <time className="text-xs text-gray-500" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                </div>
                <span className="text-sm text-blue-600 uppercase">
                  {post.categories[0]?.name || 'General'}
                </span>
              </header>
              <p className="mt-3 text-gray-700 leading-relaxed line-clamp-3">
                {post.description.replace(/<[^>]+>/g, '')}
              </p>
              <footer className="mt-4 flex items-center space-x-6 text-gray-500">
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h.01M12 7h.01M16 7h.01M9 11h6m-6 4h6"
                    />
                  </svg>
                  <span>{post.views || 0}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v16h16V4H4z"
                    />
                  </svg>
                  <span>{post.likes || 0}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-purple-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01"
                    />
                  </svg>
                  <span>{post.comments || 0}</span>
                </button>
                <button
                  onClick={() => (window.location.href = `/posts/${post.slug}`)}
                  className="ml-auto text-blue-600 hover:underline"
                >
                  View Thread
                </button>
              </footer>
            </div>
          </article>
        ))}

        <PaginationControls
          page={page}
          totalPosts={total}
          pageSize={pageSize}
          next={next}
          previous={previous}
          setPage={setPage}
        />
      </div>
    </section>
  );
};

export default PostPageGrid;
