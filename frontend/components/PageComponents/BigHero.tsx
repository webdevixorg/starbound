'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SafeImage from '../UI/SafeImage';
import { fetchPosts } from '@/services/api';
import { Post } from '@/types/types';
import { getOptimizedImageUrl } from '@/services/images';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HeroBigGrid: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        setError(null);
        const data = await fetchPosts(1, count, filter, 'post');
        setPosts(data.results.slice(0, count));
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [filter, count]);

  if (loadingPosts) {
    return <HeroSkeleton count={count} />;
  }

  if (error || posts.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
        {/* Main Large Banner Tile */}
        <div className="md:col-span-8 relative group overflow-hidden rounded-3xl shadow-2xl min-h-[400px]">
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            src="//ap-autosoe.myshopify.com/cdn/shop/files/au_banner_2.jpg?v=1732326940&width=1200"
            alt="Hero Banner"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-start justify-center p-8 md:p-16 text-white z-10">
            <div className="text-left max-w-xl">
              <h2 className="text-4xl md:text-7xl font-black uppercase leading-tight mb-4 md:mb-6 tracking-tighter">
                Save up <br />
                <span className="text-red-500">50%</span> off
              </h2>
              <p className="text-lg md:text-2xl text-gray-100 mb-8 md:mb-12 font-medium opacity-90">
                The right tools for the job!
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-3 md:px-10 md:py-4 bg-white text-black font-bold uppercase text-xs md:text-sm rounded shadow-lg transition-all duration-300 hover:bg-black hover:text-white group/btn"
              >
                shop now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="16"
                  viewBox="0 0 8 13"
                  fill="none"
                  className="transition-transform group-hover/btn:translate-x-2"
                >
                  <path
                    d="M7.46484 6.28516C7.72005 6.59505 7.72005 6.90495 7.46484 7.21484L2.21484 12.4648C1.90495 12.7201 1.59505 12.7201 1.28516 12.4648C1.02995 12.1549 1.02995 11.8451 1.28516 11.5352L6.07031 6.75L1.28516 1.96484C1.02995 1.65495 1.02995 1.34505 1.28516 1.03516C1.59505 0.779948 1.90495 0.779948 2.21484 1.03516L7.46484 6.28516Z"
                    fill="#EC2324"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Side Posts Grid - "Others" */}
        <div className="md:col-span-4 grid grid-cols-1 gap-6 h-full">
          {posts.slice(0, 2).map((post) => (
            <div
              key={post.id}
              className="relative group overflow-hidden rounded-2xl shadow-lg h-full min-h-[250px]"
            >
              <SafeImage
                alt={post.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                images={[
                  {
                    image_path: getOptimizedImageUrl(
                      post.images?.[0]?.image_path || '',
                      'medium',
                      'post',
                      post.id
                    ),
                  },
                ]}
                fill
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-white/80 text-sm font-medium hover:text-white transition-colors flex items-center gap-2 group/read"
                >
                  Read More
                  <svg
                    className="w-4 h-4 transition-transform group-hover/read:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HeroSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
      <div className="md:col-span-8 rounded-3xl overflow-hidden min-h-[400px]">
        <Skeleton height="100%" />
      </div>
      <div className="md:col-span-4 grid gap-6">
        <Skeleton count={2} height="100%" />
      </div>
    </div>
  </div>
);

export default HeroBigGrid;
