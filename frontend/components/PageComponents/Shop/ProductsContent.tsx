'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchCategories, fetchSubCategories } from '@/services/api';
import { fetchLocations, fetchSubLocations } from '@/services/apiProducts';
import {
  Category,
  SubCategory,
  SubLocation,
  Location,
  Product,
} from '@/types/types';
import ShopHeader from './ShopHeader';
import ShopSidebar from './ShopSidebar';
import ProductsGrid from './ProductsGrid';
import { useProducts } from '@/hooks/useProducts';
import useFilters from '@/hooks/useFilters';

const ProductsContent: React.FC = () => {
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const pageSize = 20;

  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subLocations, setSubLocations] = useState<SubLocation[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  const [locationOpen, setLocationOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  const {
    filters,
    setFilters,
    handleFilterChange,
    handleBack,
    handleClearAllFilters,
    filterList,
  } = useFilters({
    categories,
    subCategories,
    locations,
    subLocations,
    setSubCategories,
    setSubLocations,
  });

  const { loading, error, fetchData, debouncedFetchData, refetch } =
    useProducts({
      pageSize,
      query,
      selectedCategory,
      categories,
      setProducts,
      setTotalPosts,
    });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [locationsData, categoriesData] = await Promise.all([
          fetchLocations(),
          fetchCategories(0, 0, 16),
        ]);
        setLocations(locationsData.results || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Handle URL search parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('query')?.trim() || '';
    const categorySlug = params.get('category')?.trim() || '';

    setQuery(searchQuery);
    setSelectedCategory(categorySlug);

    if (categorySlug && categories.length > 0) {
      const matched = categories.find(
        (cat) => cat.slug.trim() === categorySlug
      );

      if (matched) {
        handleFilterChange('categories', matched.id);
        return;
      }
    }

    debouncedFetchData(orderBy, page, filters);
  }, [categories]); // Only depend on categories

  // Trigger fetch when filters, orderBy, or page change
  useEffect(() => {
    debouncedFetchData(orderBy, page, filters);
  }, [orderBy, page, filters, debouncedFetchData]);

  // Handle URL pathname for category routing
  useEffect(() => {
    if (categories.length === 0) return;

    if (typeof window === 'undefined') return;

    const pathParts = window.location.pathname.split('/');
    const categorySlugIndex = pathParts.indexOf('categories');

    if (categorySlugIndex !== -1 && pathParts[categorySlugIndex + 1]) {
      const categorySlug = pathParts[categorySlugIndex + 1];
      const category = categories.find((cat) => cat.slug === categorySlug);

      if (category) {
        handleFilterChange('categories', category.id);
      }
    }
  }, [categories, handleFilterChange]);

  // Event handlers
  const handleViewChange = useCallback(
    (type: 'list' | 'grid') => setViewType(type),
    []
  );

  const handleOrderChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) =>
      setOrderBy(event.target.value),
    []
  );

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage),
    []
  );

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalPosts);

  if (error) {
    return (
      <div className="shop-section container mx-auto my-5 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Products
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-section container mx-auto my-5 px-4 sm:px-6 lg:px-8">
      <ShopHeader
        query={query}
        start={start}
        end={end}
        totalPosts={totalPosts}
        filters={filters}
        filterList={filterList}
        orderBy={orderBy}
        viewType={viewType}
        onClearAllFilters={handleClearAllFilters}
        onOrderChange={handleOrderChange}
        onViewChange={handleViewChange}
      />

      <div className="grid grid-cols-12 gap-6">
        <ShopSidebar
          categories={categories}
          locations={locations}
          subCategories={subCategories}
          subLocations={subLocations}
          filters={filters}
          categoryOpen={categoryOpen}
          locationOpen={locationOpen}
          priceOpen={priceOpen}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryToggle={setCategoryOpen}
          onLocationToggle={setLocationOpen}
          onPriceToggle={setPriceOpen}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onFilterChange={(type: string, id: number) => {
            void handleFilterChange(type as any, id);
          }}
          onBack={handleBack}
          onPriceFilter={(min, max) => {
            setFilters((prev) => [
              ...prev.filter((f) => f.type !== 'price'),
              {
                type: 'price',
                id: 0,
                name: `${min}-${max}`,
              },
            ]);
          }}
        />

        <ProductsGrid
          products={products}
          viewType={viewType}
          page={page}
          totalPosts={totalPosts}
          pageSize={pageSize}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ProductsContent;
