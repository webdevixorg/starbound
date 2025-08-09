'use client';
import React, { useEffect, useState } from 'react';

import SafeImage from '../UI/SafeImage';
import HtmlContent from '@/helpers/content';

import { formatDate } from '@/helpers/common';
import { CategoryName } from '@/helpers/fetching';
import { getPublicImageUrl } from '@/helpers/media';

import { fetchPostsByCategory } from '@/services/api';
import { Post } from '@/types/types';
import BlogPostCard from '../UI/Cards/BlogPostCard';

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {posts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              variant="compact"
              showExcerpt={true}
              excerptLength={100}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostGrid_1;
