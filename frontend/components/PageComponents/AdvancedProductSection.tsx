'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProductsForSections } from '@/services/apiProducts';
import { Product } from '@/types/types';
import ProductCardGrid from './ProdutctCardGrid';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface CountdownState {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<CountdownState>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24))
            .toString()
            .padStart(2, '0'),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24)
            .toString()
            .padStart(2, '0'),
          minutes: Math.floor((difference / 1000 / 60) % 60)
            .toString()
            .padStart(2, '0'),
          seconds: Math.floor((difference / 1000) % 60)
            .toString()
            .padStart(2, '0'),
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 text-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col">
          <span className="text-xl font-black text-gray-900 leading-none">
            {value}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

const AdvancedProductSection: React.FC<{
  categoryId: number;
  count: number;
}> = ({ categoryId, count }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProductsForSections('latest', count); // Simplified for demo
        setProducts(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [count]);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Block: Image Text Promo */}
          <div className="w-full lg:w-1/4 relative group overflow-hidden rounded-xl bg-gray-900 min-h-[550px] p-10 flex flex-col justify-end shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-40">
              <img
                src="https://cdn.shopify.com/s/files/1/0727/2323/4839/files/au_img_adv.png?v=1732162674"
                alt="Promo"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </div>
            <div className="absolute top-10 right-10 w-24 h-24 z-20 animate-bounce">
              <img
                src="https://cdn.shopify.com/s/files/1/0727/2323/4839/files/sale_1.png?v=1732350704"
                alt="Sale"
              />
            </div>

            <div className="absolute top-1/2 right-[110px] -translate-y-1/2 z-20">
              <img
                src="https://cdn.shopify.com/s/files/1/0727/2323/4839/files/sale_2.png?v=1732356298"
                alt="Sale"
                loading="lazy"
                className="max-w-[250px] object-contain drop-shadow-2xl"
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white uppercase leading-tight mb-4 tracking-tighter">
                Select wheels <br /> and tires
              </h2>
              <p className="text-gray-300 text-sm font-medium mb-10 border-l-2 border-red-600 pl-4">
                Free shipping! Code <br />
                <span className="text-white font-bold">“FREESHIP50”</span>
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-3 bg-white text-black font-black uppercase text-[10px] rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                Shop Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="13"
                  viewBox="0 0 8 13"
                  fill="none"
                >
                  <path
                    d="M7.46484 6.28516C7.72005 6.59505 7.72005 6.90495 7.46484 7.21484L2.21484 12.4648C1.90495 12.7201 1.59505 12.7201 1.28516 12.4648C1.02995 12.1549 1.02995 11.8451 1.28516 11.5352L6.07031 6.75L1.28516 1.96484C1.02995 1.65495 1.02995 1.34505 1.28516 1.03516C1.59505 0.779948 1.90495 0.779948 2.21484 1.03516L7.46484 6.28516Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Block: Deals of the Week */}
          <div className="w-full lg:w-3/4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-gray-100 pb-8">
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      <path
                        d="M16 9.555C14.2911 9.55652 12.6527 10.236 11.4444 11.4444C10.236 12.6527 9.55652 14.2911 9.555 16C9.90728 24.5505 22.094 24.548 22.445 16C22.4435 14.2911 21.764 12.6527 20.5556 11.4444C19.3473 10.236 17.7088 9.55652 16 9.555ZM16 18.965C12.0816 18.8405 12.0825 13.1589 16.0001 13.035C19.9184 13.1594 19.9175 18.8411 16 18.965Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M16 23.945C14.4015 23.9431 12.8407 23.4593 11.5214 22.5566C10.2021 21.6539 9.18576 20.3743 8.605 18.885C7.84622 19.9305 6.70408 20.6328 5.42866 20.838C4.15323 21.0432 2.84845 20.7347 1.8 19.98C2.67136 23.0765 4.52973 25.804 7.09272 27.7479C9.65571 29.6918 12.7832 30.7459 16 30.75C20.5007 30.5911 20.4985 24.1035 16 23.945Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M27.35 12.6C26.4478 12.5999 25.5824 12.9579 24.944 13.5954C24.3055 14.2329 23.9462 15.0978 23.945 16C23.9431 17.5985 23.4592 19.1593 22.5566 20.4786C21.6539 21.7979 20.3743 22.8142 18.885 23.395C19.9191 24.1623 20.6125 25.3034 20.817 26.5747C21.0216 27.8461 20.7212 29.147 19.9799 30.2C23.0764 29.3287 25.8039 27.4703 27.7478 24.9073C29.6918 22.3443 30.7459 19.2168 30.75 16C30.7491 15.0986 30.3905 14.2343 29.7531 13.5969C29.1157 12.9595 28.2514 12.6009 27.35 12.6Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-gray-900 leading-none">
                      Best Deals of The Week!
                    </h4>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                      Quality replacement European car parts
                    </p>
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
                <CountdownTimer targetDate="2026-12-30T23:00:00" />
              </div>

              <Link
                href="/shop"
                className="text-gray-900 font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2 hover:text-red-600 transition-colors group"
              >
                <span>See All Shop</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Product Grid - Forced 2 Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <div key={i} className="h-[140px]">
                      <Skeleton height="100%" borderRadius={16} />
                    </div>
                  ))
                : products.slice(0, 6).map((product, index) => (
                    <div key={product.id} className="h-[140px]">
                      <ProductCardGrid
                        product={product}
                        imageHeight={''}
                        index={index}
                        variant="list-small"
                        className="border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-xl"
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvancedProductSection;
