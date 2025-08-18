// app/page.tsx
import React from 'react';
import BigHero from '@/components/PageComponents/BigHero';
import PostSlider from '@/components/PageComponents/PostSlider';
import PostGrid_1 from '@/components/PageComponents/PostGrid_1';
import PostGrid_2 from '@/components/PageComponents/PostGrid_2';
import ProductGridSection from '@/components/PageComponents/ProductGridSection';

const HomePage: React.FC = () => {
  return (
    <div>
      <BigHero filter="latest" count={5} />
      <ProductGridSection filter="latest" count={4} />
      <PostGrid_1 categoryId={91} count={4} title="Automotive Tech" />
      <div className="post-add mb-10">
        <div className="bg-white-50 py-6">
          <div className="flex flex-row flex-wrap">
            <a href="#">
              <img src="/images/ads/ad-1.png" alt="ad" />
            </a>
          </div>
        </div>
      </div>
      <PostGrid_2 categoryId={89} count={4} title="How-To Guides" />
      <PostGrid_1 categoryId={94} count={4} title="Motorsports & Culture" />
      <PostSlider categoryId={90} count={4} title="News & Updates" />
    </div>
  );
};

export default HomePage;
