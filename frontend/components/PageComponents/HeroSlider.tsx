'use client';

import React from 'react';
import Link from 'next/link';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { siteConfig } from '@/config/site';

const HeroSlider: React.FC = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, siteConfig.skeletonMinTime); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);

  const sliderContent = [
    {
      image: '/images/banner/au_slide_3.jpg',
      title: 'Save up to <span class="text-red-600">50%</span> off',
      subtitle: 'The right tools for the job!',
      link: '/shop',
      cta: 'Shop Now',
    },
    {
      image: '/images/banner/au_collec_img_1.jpg',
      title: 'New Arrivals <br/> 2024 Collection',
      subtitle: 'Upgrade your ride with the latest gear',
      link: '/shop',
      cta: 'Discover',
    },
    {
      image: '/images/banner/hot-3.png',
      title: 'Performance <br/> Redefined',
      subtitle: 'Top rated by our global community',
      link: '/shop',
      cta: 'View Deals',
    },
  ];

  if (loading) {
    return <HeroSliderSkeleton />;
  }

  return (
    <section className="relative w-full bg-gray-900 overflow-hidden">
      <Splide
        options={{
          type: 'fade',
          rewind: true,
          autoplay: true,
          interval: 6000,
          arrows: true,
          pagination: true,
          speed: 1000,
          height: '75vh',
          breakpoints: {
            768: { height: '60vh' },
            1024: { height: '750px' },
          },
          classes: {
            pagination: 'splide__pagination !bottom-10 z-20 gap-3',
            page: 'splide__pagination__page !w-3 !h-3 !bg-white/30 !rounded-full transition-all duration-300 [&.is-active]:!bg-red-600 [&.is-active]:!w-10 [&.is-active]:!rounded-full',
            arrow:
              'splide__arrow !bg-white/10 hover:!bg-red-600 !text-white !w-14 !h-14 !opacity-100 transition-all',
          },
        }}
      >
        {sliderContent.map((slide, idx) => (
          <SplideSlide key={idx}>
            <div className="relative w-full h-full group">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.subtitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent" />
              </div>

              {/* Content Container */}
              <div className="relative h-full container mx-auto px-6 md:px-12 flex flex-col justify-center">
                <div className="max-w-4xl">
                  {/* 1. Title: Animates up on change */}
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[1.125] md:leading-[1.125] lg:leading-[1.125] tracking-tighter text-white drop-shadow-2xl mb-6">
                    {slide.title.split(/<br\s*\/?>/i).map((line, index) => (
                      <span key={index} className="block overflow-hidden">
                        <span
                          className="block transform-gpu transition-transform duration-700 ease-[cubic-bezier(.29,.63,.44,1)] translate-y-full [.is-active_&]:translate-y-0"
                          style={{
                            transitionDelay: `${100 + index * 150}ms`,
                          }}
                          dangerouslySetInnerHTML={{ __html: line }}
                        />
                      </span>
                    ))}
                  </h2>

                  {/* 2. Subtitle: Animates up slightly later */}
                  <p className="text-xl md:text-2xl text-gray-200 font-medium border-l-4 border-red-600 pl-6 max-w-xl mb-10">
                    {slide.subtitle.split(' ').map((word, index) => (
                      <span
                        key={index}
                        className="inline-block overflow-hidden align-bottom"
                      >
                        <span
                          className="inline-block transform-gpu transition-transform duration-700 ease-[cubic-bezier(.29,.63,.44,1)] translate-y-full [.is-active_&]:translate-y-0"
                          style={{
                            transitionDelay: `${300 + index * 50}ms`,
                          }}
                        >
                          {word}
                        </span>
                        &nbsp;
                      </span>
                    ))}
                  </p>

                  {/* 3. Button: Animates up last */}
                  <div className="overflow-hidden">
                    <div
                      className="transform-gpu transition-transform duration-700 ease-[cubic-bezier(.29,.63,.44,1)] translate-y-full
                                  [.is-active_&]:translate-y-0"
                      style={{ transitionDelay: '700ms' }}
                    >
                      <Link
                        href={slide.link}
                        className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-bold uppercase text-sm tracking-[0.2em] rounded-full shadow-2xl transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-105 group/btn"
                      >
                        {slide.cta}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform group-hover/btn:translate-x-2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </section>
  );
};

const HeroSliderSkeleton: React.FC = () => (
  <section
    className="relative w-full bg-gray-200 overflow-hidden"
    style={{ height: '75vh' }}
  >
    <div className="w-full h-full">
      <Skeleton height="100%" />
    </div>
  </section>
);

export default HeroSlider;
