// src/pages/ProductSingle.tsx

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import PaymentMethods from '../components/UI/Icons/PaymentMethods';
import { formatCurrency } from '../helpers/common';
import TickSheildIcon from '../components/UI/Icons/TickSheild';
import { Product } from '../types/types';
import ProductCardGrid from '../components/PageComponents/ProdutctCardGrid';
import HtmlContent from '../helpers/content';
import AddToCartButton from '../components/UI/Buttons/AddToCart';
import HeartIcon from '../components/UI/Icons/Heart';
import Compare from '../components/UI/Icons/Compare';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from '../services/apiProducts';
import Rating from '../components/Common/Rating';
import ReviewsSystem from '../components/PageComponents/Review';
import ProductGallery from '../components/PageComponents/ProductGallery';
import ShareSection from '../components/PageComponents/Share/ShareSection';

interface RouteParams {
  [slug: string]: string | undefined;
}

const ProductSingle: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Use useAuth hook to get the current user
  const { state } = useCart();
  const navigate = useNavigate();

  const { slug } = useParams<RouteParams>(); // Get the product ID from the URL params
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index: React.SetStateAction<number>) => {
    setActiveTab(index);
  };

  const [quantity, setQuantity] = useState<number>(1);

  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrement = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug) {
          // Fetch the main product details
          const adData = await fetchProductBySlug(slug);
          setProduct(adData);

          // Fetch related products
          const relatedData = await fetchRelatedProducts(slug);
          setRelatedProducts(relatedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <div className="product-page">
      <section
        role="banner"
        className="entry-hero product-hero-section entry-hero-layout-standard bg-gray-100"
      >
        <div className="relative">
          <div className="container mx-auto px-4 py-8">
            <header className="text-left">
              <BreadcrumbsComponent product={product} />
            </header>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {product ? (
          <div className="mb-5">
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ProductGallery product={product} />
                </div>
                <div className="px-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl text-blue-600">{product.title}</h2>
                    {isAuthenticated && (
                      <a
                        href={`/products/${product.slug}/edit`}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </a>
                    )}
                  </div>
                  <div className="mb-4">
                    <Rating reviews={0}></Rating>
                  </div>
                  <div className="mb-4">
                    <p className="text-secondary mb-2 pb-2 font-bold border-b">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-8">
                    {product.short_description}
                  </p>
                  <div className="cart flex items-center mb-1">
                    <div className="quantity flex items-center border border-gray-300 mr-4">
                      <button
                        type="button"
                        className="minus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2"
                        onClick={handleDecrement}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        id="quantity"
                        className="input-text qty bg-gray-200 text-center py-1 px-1 w-10"
                        name="quantity"
                        value={quantity}
                        aria-label="Product quantity"
                        min="1"
                        max=""
                        step="1"
                        placeholder=""
                        inputMode="numeric"
                        autoComplete="off"
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      />
                      <button
                        type="button"
                        className="plus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2"
                        onClick={handleIncrement}
                      >
                        +
                      </button>
                    </div>
                    <AddToCartButton product={product} />
                  </div>
                  <div className="flex justify-end">
                    {state.items.length > 0 && (
                      <a
                        onClick={() => navigate('/cart')}
                        className="mt-4 text-blue-500 underline hover:text-blue-700 cursor-pointer"
                      >
                        View Cart
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-4 py-2 mb-4 border-b">
                    <button
                      className="flex items-center space-x-2 font-bold rounded border-r pr-4"
                      data-id="{product.id}"
                      data-product_name="{product.title}"
                      data-product_image="{product.images[0].image}"
                    >
                      <span className="starbound-btn-icon starbound-icon-1">
                        <Compare />
                      </span>
                      <span className="starbound-btn-text">Compare</span>
                    </button>

                    <button
                      className="flex items-center space-x-2 font-bold rounded"
                      data-id="{product.id}"
                      data-product_name="{product.title}"
                      data-product_image="{product.images[0].image}"
                    >
                      <span className="starbound-btn-icon starbound-icon-1">
                        <HeartIcon />
                      </span>
                      <span className="starbound-btn-text">
                        Add to wishlist
                      </span>
                    </button>
                  </div>

                  <ul className="mb-4 list-none p-0">
                    <li className="flex items-center mb-2">
                      <TickSheildIcon />
                      <p className="text-sm text-gray-600 ml-2">
                        Estimated Delivery : Up to 4 business days
                      </p>
                    </li>
                    <li className="flex items-center mb-2">
                      <TickSheildIcon />
                      <p className="text-sm text-gray-600 ml-2">
                        Shipping & Returns : On all orders over Rs. 20,000
                      </p>
                    </li>
                  </ul>

                  <PaymentMethods />
                  <div className="product_meta mt-4 text-gray-600 text-sm">
                    <span className="sku_wrapper block">
                      SKU: <span className="sku">{product.sku}</span>
                    </span>

                    <span className="posted_in block">
                      Categories:
                      {product.categories.map((category, index) => (
                        <React.Fragment key={category.slug}>
                          <Link
                            to={`/products/categories/${category.slug}`}
                            rel="tag"
                            className="text-gray-500 underline hover:text-primary-500 ml-1"
                          >
                            {category.name}
                          </Link>
                          {index < product.categories.length - 1 && ', '}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>

                  <ShareSection product={product} />
                </div>
              </div>
            </div>
            {/* Tabs for additional content */}
            <div className="border-b border-gray-200 mt-4">
              <nav className="flex space-x-8">
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 0
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange(0)}
                >
                  Description
                </button>
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 1
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange(1)}
                >
                  Additional Information
                </button>
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 2
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange(2)}
                >
                  Reviews
                </button>
              </nav>
            </div>
            {/* Tab content */}
            <div className="mt-4">
              {activeTab === 0 && (
                <div className="starbound-product-table">
                  <HtmlContent htmlContent={product.description} />
                </div>
              )}
              {activeTab === 1 && (
                <div className="starbound-product-table">
                  {product.additional_info ? (
                    <HtmlContent htmlContent={product.additional_info} />
                  ) : (
                    <p>No additional information available.</p>
                  )}
                </div>
              )}
              {activeTab === 2 && <ReviewsSystem product={product} />}
            </div>
          </div>
        ) : (
          <h3 className="text-lg text-red-500">product not found</h3>
        )}

        {/* Render related products */}
        <h2 className="text-2xl my-4">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {relatedProducts.map((product) => (
            <div key={product.id} className="col-span-1">
              <ProductCardGrid product={product} imageHeight={''} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSingle;
