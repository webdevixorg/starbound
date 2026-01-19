'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SafeImage from '../UI/SafeImage';
import { Post } from '@/types/types';
import { fetchPostsByCategory } from '@/services/api';
import { getOptimizedImageUrl } from '@/services/images';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import HtmlContent from '@/helpers/content';

interface BannerPostsProps {
  categoryId: number;
  count: number;
  bannerImage: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerLink?: string;
}

const BannerPosts: React.FC<BannerPostsProps> = ({
  categoryId,
  count,
  bannerImage,
  bannerTitle = 'Save up 50% off',
  bannerSubtitle = 'The right tools for the job!',
  bannerLink = '/shop',
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchPostsByCategory(categoryId, count);
        setPosts(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [categoryId, count]);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Large Banner Section */}
          <div className="lg:col-span-8 relative group overflow-hidden rounded-3xl shadow-2xl min-h-[500px]">
            <img
              src={bannerImage}
              alt="Promotion"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-12">
              <div className="max-w-lg">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase leading-tight mb-6 tracking-tighter">
                  Save up <br />
                  <span className="text-red-600">50%</span> off
                </h2>
                <p className="text-xl md:text-2xl text-white font-medium mb-10 opacity-90">
                  {bannerSubtitle}
                </p>
                <Link
                  href={bannerLink}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-bold uppercase text-sm rounded shadow-xl hover:bg-black hover:text-white transition-all duration-300 group/btn"
                >
                  Shop Now
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

          {/* Posts List Section */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 h-32">
                    <div className="w-1/3 rounded-2xl overflow-hidden">
                      <Skeleton height="100%" />
                    </div>
                    <div className="w-2/3 py-2">
                      <Skeleton count={2} />
                    </div>
                  </div>
                ))
              : posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="flex gap-4 group h-32 hover:bg-gray-50 rounded-2xl transition-colors p-2"
                  >
                    <div className="w-1/3 relative overflow-hidden rounded-xl bg-gray-100">
                      <SafeImage
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        images={[
                          {
                            image_path: getOptimizedImageUrl(
                              post.images?.[0]?.image_path || '',
                              'thumb',
                              'post',
                              post.id
                            ),
                          },
                        ]}
                        fill
                      />
                    </div>
                    <div className="w-2/3 py-1 flex flex-col justify-center">
                      <div className="text-[10px] font-bold uppercase text-red-600 tracking-widest mb-1">
                        {post.categories?.[0]?.name || 'Auto News'}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                        {post.title}
                      </h3>
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerPosts;
