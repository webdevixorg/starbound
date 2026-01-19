// app/(main)/page.tsx
import React from 'react';

import BigHero from '@/components/PageComponents/BigHero';
import PostSlider from '@/components/PageComponents/PostSlider';
import PostGrid_1 from '@/components/PageComponents/PostGrid_1';
import PostGrid_2 from '@/components/PageComponents/PostGrid_2';
import ProductGridSection from '@/components/PageComponents/ProductGridSection';
import AdSection from '@/components/PageComponents/AdSection';

const HomePage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <BigHero filter="latest" count={5} />
      <ProductGridSection filter="latest" count={4} />
      <PostGrid_1 categoryId={91} count={4} title="Automotive Tech" />
      {/* Ad Section */}
      <AdSection
        imageUrl="/images/ads/ad-1.png"
        altText="Promotional Ad"
        linkHref="#"
        title="Experience the Future of Automotive"
        description="Discover cutting-edge technology and exclusive offers."
      />
      <PostGrid_2 categoryId={89} count={4} title="How-To Guides" />
      <PostGrid_1 categoryId={94} count={4} title="Motorsports & Culture" />
      <PostSlider categoryId={90} count={4} title="News & Updates" />
    </div>
  );
};

export default HomePage;
