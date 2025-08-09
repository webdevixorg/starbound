import React, { useEffect, useState } from 'react';
import BlogPostCard from '@/components/UI/Cards/BlogPostCard';
import FeaturedProductCard from '@/components/UI/Cards/FeaturedProductCard';
import { Post, Product } from '@/types/types';
import { fetchPosts } from '@/services/api';
import { fetchFeaturedAds } from '@/services/apiProducts';

interface SubItem {
  label: string;
  href: string;
}

interface MenuItem {
  title: string;
  items: SubItem[];
}

interface MegaMenuProps {
  isOpen: boolean;
  menuItems: MenuItem[];
  label: string;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, menuItems, label }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState<number>(1);
  const [pageSize] = useState<number>(2);
  const [status] = useState<string>('Published');
  const [filter] = useState<string>('latest');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        const data = await fetchPosts(page, pageSize, status, filter, 'post');
        setPosts(data.results || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Error fetching posts');
      } finally {
        setLoadingPosts(false);
      }
    };

    const loadFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await fetchFeaturedAds();
        console.log('Featured products data:', data);
        setFeaturedProducts(data.slice(0, 2));
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Error fetching featured products');
      } finally {
        setLoadingProducts(false);
      }
    };

    if (isOpen) {
      loadPosts();
      loadFeaturedProducts();
    }
  }, [page, pageSize, status, filter, isOpen]);

  return (
    <div
      className={`${
        isOpen ? 'block' : 'invisible'
      } sub-menu absolute inset-x-0 transform z-50`}
    >
      <div className="bg-white dark:bg-neutral-900 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex text-sm border-slate-200 dark:border-slate-700 py-6">
            {/* Menu Items */}
            <div className="flex-1 grid grid-cols-4 gap-6 pr-6 xl:pr-8">
              {menuItems.map((menu, index) => (
                <div key={index}>
                  <p className="font-medium text-slate-900 dark:text-neutral-200">
                    {menu.title}
                  </p>
                  <ul className="grid mt-4 space-y-2">
                    {menu.items.map((item, idx) => (
                      <li key={idx}>
                        <a
                          className="font-normal text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors"
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Blog Posts Section */}
            {label.toLowerCase() === 'blog' && (
              <div className="w-[40%]">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200">
                    Latest Posts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Stay updated with our recent articles
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {loadingPosts && (
                    <div className="col-span-full">
                      <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  )}

                  {error && !loadingPosts && (
                    <div className="col-span-full">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {!loadingPosts &&
                    !error &&
                    posts.map((post) => (
                      <BlogPostCard
                        key={post.id}
                        post={post}
                        variant="compact"
                        showExcerpt={true}
                        excerptLength={100}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Featured Products Section */}
            {label.toLowerCase() === 'categories' && (
              <div className="w-[40%]">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200">
                    Featured Products
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Check out our top picks
                  </p>
                </div>

                {loadingProducts && (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                )}

                {error && !loadingProducts && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {!loadingProducts &&
                    !error &&
                    featuredProducts.map((product) => (
                      <FeaturedProductCard
                        key={product.id}
                        product={product}
                        variant="compact"
                        showPrice={true}
                        showCategory={true}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
