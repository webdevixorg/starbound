// app/(main)/page.tsx
import React from 'react';

import HeroSlider from '@/components/PageComponents/HeroSlider';
import PostSlider from '@/components/PageComponents/PostSlider';
import CategoryPostGrid from '@/components/PageComponents/CategoryPostGrid';
import PostListWithSidebar from '@/components/PageComponents/PostListWithSidebar';
import ProductGridSection from '@/components/PageComponents/ProductGridSection';
import AdSection from '@/components/PageComponents/AdSection';
import AdvancedProductSection from '@/components/PageComponents/AdvancedProductSection';
import BannerPosts from '@/components/PageComponents/BannerPosts';
import HeroFeaturedGrid from '@/components/PageComponents/HeroFeaturedGrid';

const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      <HeroSlider />
      <HeroFeaturedGrid filter="latest" count={5} />

      <AdvancedProductSection categoryId={91} count={6} />

      <div className="container mx-auto px-4">
        <ProductGridSection filter="latest" count={4} />
      </div>

      <BannerPosts
        categoryId={91}
        count={3}
        bannerImage="/images/banner/hot-3.png"
      />
      <CategoryPostGrid categoryId={91} count={4} title="Automotive Tech" />
      {/* Ad Section */}
      <AdSection
        imageUrl="/images/ads/ad-1.png"
        altText="Promotional Ad"
        linkHref="#"
        title="Experience the Future of Automotive"
        description="Discover cutting-edge technology and exclusive offers."
      />
      <PostListWithSidebar categoryId={89} count={4} title="How-To Guides" />
      <CategoryPostGrid
        categoryId={94}
        count={4}
        title="Motorsports & Culture"
      />
      <PostSlider categoryId={90} count={4} title="News & Updates" />
    </div>
  );
};

export default HomePage;
