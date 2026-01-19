'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import LoadingSpinner from '@/components/Common/Loading';
import HtmlContent from '@/helpers/content';
import SafeImage from '../UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';
import { Post } from '@/types/types';
import { fetchPostsByCategory } from '@/services/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SliderNewsProps {
  categoryId: number;
  count: number;
  title: string;
}

const SlideCard: React.FC<{ post: Post; index: number }> = ({
  post,
  index,
}) => {
  // Get day and month separately with fallback for invalid dates
  const dateObj = new Date(post.created_at);
  const isValidDate = !isNaN(dateObj.getTime());
  const day = isValidDate ? dateObj.getDate() : 1;
  const month = isValidDate
    ? dateObj.toLocaleDateString('en-US', { month: 'short' })
    : 'Jan';

  return (
    <div className="relative group rounded-3xl overflow-hidden bg-white h-full flex flex-col border border-gray-100 hover:shadow-2xl transition-all duration-500">
      {/* Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <Link href={`/posts/${post.slug}`} className="block h-full">
          <SafeImage
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
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
            priority={index < 4}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Date Tag */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg z-20 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
            <span className="font-black text-lg leading-none">{day}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {month}
            </span>
          </div>

          {/* Categories - Bottom of Image */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
            {post.categories?.slice(0, 2).map((category, idx) => (
              <span
                key={`${post.id}-cat-${idx}`}
                className="bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm shadow-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
        </Link>
      </div>

      {/* Text Content */}
      <div className="p-6 flex-1 flex flex-col">
        <Link href={`/posts/${post.slug}`} className="block mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors duration-300 leading-tight">
            {post.title}
          </h3>
        </Link>
        {post.description && (
          <div className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow leading-relaxed">
            <HtmlContent htmlContent={post.description} />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <Link
            href={`/posts/${post.slug}`}
            className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2 group/link hover:text-red-600 transition-colors"
          >
            Read Story
            <svg
              className="w-4 h-4 transition-transform group-hover/link:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <div className="flex items-center gap-2 text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-[10px] font-medium tracking-tighter">
              1.8k
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SliderNews: React.FC<SliderNewsProps> = ({
  categoryId,
  count,
  title = 'Post List',
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const splideOptions = useMemo(
    () => ({
      type: 'loop' as const,
      perPage: 3,
      gap: '1rem',
      autoplay: true,
      interval: 4000, // Slightly longer interval
      pauseOnHover: true,
      resetProgress: false,
      lazyLoad: 'nearby' as const, // Enable lazy loading
      breakpoints: {
        1024: { perPage: 2 },
        768: { perPage: 1 },
        640: { perPage: 1, gap: '0.5rem' },
      },
    }),
    []
  );

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPostsByCategory(categoryId, count);
        setPosts(data.results?.slice(0, count) || []);
      } catch (err) {
        console.error(`Error fetching ${categoryId} news:`, err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [categoryId, count]);

  if (loading) {
    return (
      <div className="relative mb-16 container mx-auto px-4">
        {/* Title Skeleton */}
        <div className="my-10">
          <Skeleton height={40} width={300} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Banner Skeleton */}
          <div className="lg:col-span-4">
            <Skeleton height={500} borderRadius={24} />
          </div>
          {/* Slider Skeleton */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <Skeleton height={256} />
                <div className="p-6 space-y-3">
                  <Skeleton height={24} width="80%" />
                  <Skeleton count={2} height={16} />
                  <div className="pt-4 flex justify-between items-center">
                    <Skeleton width={100} height={20} />
                    <Skeleton circle width={32} height={32} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-gray-900 py-16">
        <div className="container mx-auto px-5 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="relative bg-gray-900 py-16">
        <div className="container mx-auto px-5 text-center">
          <p className="text-gray-400">No posts available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-16 container mx-auto px-4">
      {/* Title */}
      <div className="my-10">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
          <span className="inline-block h-8 border-l-4 border-red-600 mr-4" />
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Large Banner Tile - First Tile */}
        <div className="col-span-12 lg:col-span-4 h-full">
          <div
            id="block-banner_grid_iQp6cp"
            className="relative group rounded-3xl overflow-hidden h-full min-h-[450px] shadow-2xl"
          >
            <div className="banner-content has-overlay h-full relative">
              <div className="banner-image h-full">
                <img
                  className="banner-list-image w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                  alt="Promotion"
                  src="/images/banner/au_collec_img_1.jpg"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 flex flex-col items-start justify-center p-10 text-white z-10">
                <div className="text-left">
                  <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight mb-4 tracking-tighter">
                    Save up <br />
                    <span className="text-red-500 font-bold">50%</span> off
                  </h2>
                  <p className="text-lg text-gray-100 mb-8 font-medium">
                    The right tools for the job!
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase text-xs rounded shadow-lg transition-all duration-300 hover:bg-black hover:text-white group/btn"
                  >
                    shop now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      className="transition-transform group-hover/btn:translate-x-1"
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
          </div>
        </div>

        {/* Other Tiles - Splide Slider */}
        <div className="col-span-12 lg:col-span-8">
          <Splide
            options={{
              ...splideOptions,
              perPage: 2,
              breakpoints: {
                1024: { perPage: 2 },
                768: { perPage: 1 },
                640: { perPage: 1 },
              },
            }}
          >
            {posts.map((post, index) => (
              <SplideSlide key={post.id}>
                <div className="h-full pr-1">
                  <SlideCard post={post} index={index} />
                </div>
              </SplideSlide>
            ))}
          </Splide>
        </div>
      </div>
    </div>
  );
};

export default SliderNews;
