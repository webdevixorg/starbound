import React from 'react';
import BigHero from '../../components/PageComponents/BigHero';
import PostSlider from '../../components/PageComponents/PostSlider';
import PostGrid_1 from '../../components/PageComponents/PostGrid_1';
import PostGrid_2 from '../../components/PageComponents/PostGrid_2';
import ProductGridSection from '../../components/PageComponents/ProductGridSection';

const Home: React.FC = () => {
  return (
    <div>
      <BigHero filter="latest" count={5} />
      <ProductGridSection filter="latest" count={4} />
      <PostGrid_1 filter="latest" count={4} />
      <div className="post-add mt-30">
        <div className="bg-white-50 py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex flex-row flex-wrap">
              <a href="#">
                <img src="/images/ad-1.png" alt="ad" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <PostGrid_2 filter="latest" count={4} />
      <PostSlider filter="latest" count={4} />
    </div>
  );
};

export default Home;
