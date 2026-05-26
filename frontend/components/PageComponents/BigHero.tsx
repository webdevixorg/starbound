'use client';

import React from 'react';
import Link from 'next/link';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const HeroBigGrid: React.FC = () => {
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

  return (
    <section className="relative w-full bg-gray-900 overflow-hidden">
      <Splide
        options={{
          type: 'fade', // This stops the images from sliding horizontally
          rewind: true, // Smooth loop for fade type
          autoplay: true,
          interval: 5000,
          arrows: false, // Arrows removed as requested
          pagination: true,
          speed: 1200, // Duration of the cross-fade
          height: '85vh',
          breakpoints: {
            768: { height: '60vh' },
            1024: { height: '750px' },
          },
          classes: {
            pagination: 'splide__pagination !bottom-10 z-20 gap-3',
            page: 'splide__pagination__page !w-3 !h-3 !bg-white/30 !rounded-full transition-all duration-300 [&.is-active]:!bg-red-600 [&.is-active]:!w-10 [&.is-active]:!rounded-full',
          },
        }}
      >
        {sliderContent.map((slide, idx) => (
          <SplideSlide key={idx}>
            <div className="relative w-full h-full">
              {/* Background Image - Stays in location with Fade effect */}
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
                  <h2
                    className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-2xl mb-6
                               transform transition-all duration-1000 ease-out translate-y-12 opacity-0
                               [.is-active_&]:translate-y-0 [.is-active_&]:opacity-100 delay-200"
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                  />

                  {/* 2. Subtitle: Animates up slightly later */}
                  <p
                    className="text-xl md:text-2xl text-gray-200 font-medium border-l-4 border-red-600 pl-6 max-w-xl mb-10
                                transform transition-all duration-1000 ease-out translate-y-12 opacity-0
                                [.is-active_&]:translate-y-0 [.is-active_&]:opacity-100 delay-500"
                  >
                    {slide.subtitle}
                  </p>

                  {/* 3. Button: Animates up last */}
                  <div
                    className="transform transition-all duration-1000 ease-out translate-y-12 opacity-0
                                  [.is-active_&]:translate-y-0 [.is-active_&]:opacity-100 delay-700"
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
          </SplideSlide>
        ))}
      </Splide>
    </section>
  );
};

export default HeroBigGrid;
