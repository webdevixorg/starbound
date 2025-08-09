'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchCategories } from '@/services/api';
import { fetchLocations } from '@/services/apiProducts';
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
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const { loading, error, debouncedFetchData, refetch } = useProducts({
    pageSize,
    query,
    selectedCategory,
    categories,
    setProducts,
    setTotalPosts,
  });

  // Handle URL search parameters synchronization
  useEffect(() => {
    if (!searchParams) return;

    const urlQuery = searchParams.get('query')?.trim() || '';
    const urlCategory = searchParams.get('category')?.trim() || '';

    // Update local state from URL
    setQuery(urlQuery);
    setSelectedCategory(urlCategory);

    // If there's a category in URL, find and set it in filters
    if (urlCategory && categories.length > 0) {
      const matchedCategory = categories.find(
        (cat) => cat.slug === urlCategory || cat.name === urlCategory
      );

      if (matchedCategory) {
        console.log('🎯 Matched category from URL:', matchedCategory);
        handleFilterChange('categories', matchedCategory.id);
      }
    }
  }, [searchParams, categories, handleFilterChange]);

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
        console.error('❌ Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

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
        console.log('🔗 Category from pathname:', category);
        setSelectedCategory(category.slug);
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
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setOrderBy(event.target.value);
      setPage(1); // Reset to first page when changing order
    },
    []
  );

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage),
    []
  );

  // Update URL when search/filters change
  const updateURL = useCallback(
    (searchQuery: string, categorySlug: string) => {
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.set('query', searchQuery.trim());
      }

      if (categorySlug.trim()) {
        params.set('category', categorySlug.trim());
      }

      const newURL = params.toString() ? `/shop?${params.toString()}` : '/shop';

      // Only update URL if it's different from current
      const currentURL = `${window.location.pathname}${window.location.search}`;
      if (newURL !== currentURL) {
        router.push(newURL, { scroll: false });
      }
    },
    [router]
  );

  // Handle search from SearchBar component
  const handleSearch = useCallback(
    (searchQuery: string, categorySlug?: string) => {
      console.log('🔍 Search triggered:', { searchQuery, categorySlug });

      setQuery(searchQuery);
      setSelectedCategory(categorySlug || '');
      setPage(1); // Reset to first page

      // Update URL
      updateURL(searchQuery, categorySlug || '');
    },
    [updateURL]
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
        onSearch={handleSearch} // Pass search handler to header
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
            void handleFilterChange(
              type as
                | 'categories'
                | 'locations'
                | 'subcategories'
                | 'sublocations',
              id
            );
          }}
          onBack={handleBack}
          onPriceFilter={(min, max) => {
            setFilters((prev) => [
              ...prev.filter((f) => f.type !== 'price'),
              {
                type: 'price',
                id: 0,
                name: `${min}-${max}`,
                min,
                max,
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
