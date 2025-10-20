'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import LoadingSpinner from '@/components/Common/Loading';
import HtmlContent from '@/helpers/content';
import SafeImage from '../UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';
import { CategoryName } from '@/helpers/fetching';
import { Post } from '@/types/types';
import { fetchPostsByCategory } from '@/services/api';

interface SliderNewsProps {
  categoryId: number;
  count: number;
  title: string;
}

const SlideCard: React.FC<{ post: Post; index: number }> = ({
  post,
  index,
}) => {
  const imageUrl = getPublicImageUrl(
    'posts',
    post.id,
    post.images?.[0]?.image_path
  );

  // Get day and month separately with fallback for invalid dates
  const dateObj = new Date(post.created_at);
  const isValidDate = !isNaN(dateObj.getTime());
  const day = isValidDate ? dateObj.getDate() : 1; // Fallback to 1 if invalid
  const month = isValidDate
    ? dateObj.toLocaleDateString('en-US', { month: 'short' })
    : 'Jan'; // Fallback to 'Jan' if invalid

  return (
    <div className="relative group rounded-lg overflow-hidden shadow-lg bg-white h-full flex flex-col">
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden">
        <Link href={`/posts/${post.slug}`}>
          <SafeImage
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            images={[{ image_path: imageUrl }]}
            fill
            priority={index < 3}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

          {/* Date Tag */}

          <div className="absolute top-0 right-0 bg-indigo-600 px-4 text-white rounded-full h-16 w-16 flex flex-col items-center justify-center mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
            <span className="font-bold">{day}</span>
            <small>{month}</small>
          </div>
          {/* Categories - Bottom of Image */}
          <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-1">
            {post.categories?.map((category, idx) => (
              <span
                key={`${post.id}-cat-${idx}`}
                className="bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded-full"
              >
                <CategoryName categoryId={category} />
              </span>
            ))}
          </div>
        </Link>
      </div>

      {/* Text Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <Link href={`/posts/${post.slug}`}>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-blue-500 transition-colors">
            {post.title}
          </h3>
        </Link>
        {post.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
            <HtmlContent htmlContent={post.description} />
          </p>
        )}
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
      <div className="relative bg-gray-900 py-16">
        <div className="container mx-auto px-5">
          <LoadingSpinner />
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
    <div
      className="relative bg-gray-50"
      style={{
        backgroundImage: "url('/images/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="bg-black/70">
        <div className="container mx-auto px-5 py-8 lg:py-12">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-white text-2xl lg:text-3xl font-bold">
              <span className="inline-block h-5 border-l-4 border-red-600 mr-3" />
              {title}
            </h2>
          </div>

          {/* Slider */}
          <Splide options={splideOptions}>
            {posts.map((post, index) => (
              <SplideSlide key={post.id}>
                <SlideCard post={post} index={index} />
              </SplideSlide>
            ))}
          </Splide>
        </div>
      </div>
    </div>
  );
};

export default SliderNews;
