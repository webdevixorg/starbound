import React, { useEffect, useState } from 'react';
import { fetchPosts } from '../../services/api';
import { Post, Product } from '../../types/types';
import { formatDate } from '../../helpers/common';
import ProductCardGrid from '../PageComponents/ProdutctCardGrid';
import HtmlContent from '../../helpers/content';
import { fetchFeaturedAds } from '../../services/apiProducts';

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
        const data = await fetchPosts(page, pageSize, status, filter, 'post');

        setPosts(data.results);
        setLoadingPosts(false);
      } catch (error) {
        setError('Error fetching posts');
        setLoadingPosts(false);
      }
    };

    const loadFeaturedProducts = async () => {
      try {
        const data = await fetchFeaturedAds();
        setFeaturedProducts(data.results.slice(0, 2)); // Slice the array to get the latest two products
        setLoadingProducts(false);
      } catch (error) {
        setError('Error fetching featured products');
        setLoadingProducts(false);
      }
    };

    loadPosts();
    loadFeaturedProducts();
  }, []);

  return (
    <div
      className={`${
        isOpen ? 'block' : 'invisible'
      } sub-menu absolute inset-x-0 transform z-50`}
    >
      <div className="bg-white dark:bg-neutral-900 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex text-sm border-slate-200 dark:border-slate-700 py-6">
            <div className="flex-1 grid grid-cols-4 gap-6 pr-6 xl:pr-8">
              {menuItems.map((menu, index) => (
                <div key={index}>
                  <p className="font-medium text-slate-900 dark:text-neutral-200">
                    {menu.title}
                  </p>
                  <ul className="grid mt-4">
                    {menu.items.map((item, idx) => (
                      <li key={idx}>
                        <a
                          className="font-normal text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white"
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
            {label.toLowerCase() === 'blog' && (
              <div className="w-[40%]">
                <div className="grid grid-cols-1 gap-10 sm:gap-8 lg:grid-cols-2">
                  <h3 className="sr-only">Recent posts</h3>
                  {loadingPosts && <p>Loading posts...</p>}
                  {error && <p>{error}</p>}
                  {!loadingPosts &&
                    !error &&
                    posts.map((post) => (
                      <article
                        key={post.id}
                        className="relative isolate flex max-w-2xl flex-col gap-x-8 gap-y-6 sm:flex-row sm:items-start lg:flex-col lg:items-stretch"
                      >
                        <div className="relative flex-none">
                          <div className="aspect-[2/1] w-full rounded-xl bg-gray-100 sm:aspect-[16/9] sm:h-32 lg:h-auto z-0">
                            <a href={`posts/${post.slug}`}>
                              <img
                                alt={post.title}
                                className="object-cover object-cover absolute inset-0 w-full h-full"
                                sizes="300px"
                                src={
                                  post.images &&
                                  post.images[0] &&
                                  post.images[0] &&
                                  post.images[0]
                                    ? post.images[0].image_path
                                    : '/assets/image_placeholder.jpg'
                                }
                              />
                            </a>
                          </div>
                          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-x-4">
                            <time
                              dateTime={post.date}
                              className="text-sm leading-6 text-gray-600"
                            >
                              {formatDate(post.date)}
                            </time>
                            <a
                              className="relative z-10 rounded-full bg-gray-50 py-1.5 px-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                              href={
                                post.categories && post.categories.length > 0
                                  ? `/category/${post.categories[0].slug}`
                                  : '#'
                              }
                            >
                              {post.categories && post.categories.length > 0
                                ? post.categories[0].name
                                : 'Default'}
                            </a>
                          </div>
                          <h4 className="mt-2 text-sm font-semibold leading-6 text-gray-900">
                            <a href={`/posts/${post.slug}`}>
                              <span className="absolute inset-0"></span>
                              {post.title}
                            </a>
                          </h4>
                          <p className="text-sm leading-6 text-gray-600">
                            <HtmlContent htmlContent={post.description} />
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            )}
            {label.toLowerCase() === 'products' && (
              <div className="w-[40%]">
                <h3 className="text-sm font-semibold text-gray-900">
                  Featured Products
                </h3>
                {loadingProducts && <p>Loading products...</p>}
                {error && <p>{error}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 mt-4">
                  {!loadingProducts &&
                    !error &&
                    featuredProducts.map((product) => (
                      <div key={product.id} className="col-span-1">
                        <ProductCardGrid product={product} imageHeight={'32'} />
                      </div>
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
