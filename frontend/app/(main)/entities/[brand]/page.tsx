'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import {
  fetchBrands,
  fetchModelsByBrandId,
  fetchEntityBySlug,
  Entity,
  EntitiesResponse,
} from '@/services/entities';

const BrandPage: React.FC = () => {
  const [brands, setBrands] = useState<Entity[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Entity | null>(null);
  const [models, setModels] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Brands pagination
  const [brandsCurrentPage, setBrandsCurrentPage] = useState(1);
  const [brandsTotalPages, setBrandsTotalPages] = useState(1);
  const [brandsTotalCount, setBrandsTotalCount] = useState(0);
  const [brandsPageSize] = useState(12);

  // Models pagination
  const [modelsCurrentPage, setModelsCurrentPage] = useState(1);
  const [modelsTotalPages, setModelsTotalPages] = useState(1);
  const [modelsTotalCount, setModelsTotalCount] = useState(0);
  const [modelsPageSize] = useState(10);

  const router = useRouter();
  const params = useParams();

  const pathname = usePathname();

  // Break down URL segments
  const urlSegments = (pathname ?? '').split('/').filter(Boolean);

  // Get brand slug from URL
  const brandSlugFromUrl = (params?.brand as string) || urlSegments[1];
  console.log('Brand slug from URL:', brandSlugFromUrl);
  // Debounce search to avoid too many API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadBrands = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);

        const response: EntitiesResponse = await fetchBrands({
          page,
          pageSize: brandsPageSize,
          search: debouncedSearchQuery || undefined,
        });

        console.log('Brands response:', response);

        let brandList: Entity[] = [];
        if (response.results && Array.isArray(response.results)) {
          brandList = response.results;
          setBrandsTotalCount(response.count || 0);
          setBrandsTotalPages(
            Math.ceil((response.count || 0) / brandsPageSize)
          );
        } else if (Array.isArray(response)) {
          brandList = response;
          setBrandsTotalCount(brandList.length);
          setBrandsTotalPages(1);
        }

        setBrands(brandList);
        setBrandsCurrentPage(page);
      } catch (error) {
        console.error('Error loading brands:', error);
        setBrands([]);
        setBrandsTotalCount(0);
        setBrandsTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [brandsPageSize, debouncedSearchQuery]
  );

  const loadModels = useCallback(
    async (brand: Entity, page: number = 1) => {
      try {
        console.log('Loading models for brand:', brand, 'page:', page);

        if (page === 1) {
          setModelsLoading(true);
          setSelectedBrand(brand);
          setModels([]);
          setModelsError(null);
        }

        const response: EntitiesResponse = await fetchModelsByBrandId(
          brand.id,
          {
            page,
            pageSize: modelsPageSize,
          }
        );

        console.log('Models response:', response);

        let modelList: Entity[] = [];
        if (response && response.results && Array.isArray(response.results)) {
          modelList = response.results;
          setModelsTotalCount(response.count || 0);
          setModelsTotalPages(
            Math.ceil((response.count || 0) / modelsPageSize)
          );
        } else if (response && Array.isArray(response)) {
          modelList = response;
          setModelsTotalCount(modelList.length);
          setModelsTotalPages(1);
        } else if (response && response.data && Array.isArray(response.data)) {
          modelList = response.data;
          setModelsTotalCount(modelList.length);
          setModelsTotalPages(1);
        }

        console.log('Processed models:', modelList);

        setModels(modelList);
        setModelsCurrentPage(page);

        // Update URL with selected brand
        if (brand.slug && !brandSlugFromUrl) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('brand', brand.slug);
          router.replace(newUrl.pathname + newUrl.search, { scroll: false });
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        console.error('Error loading models:', error);
        setModels([]);
        setModelsError(err.message || 'Failed to load models');
        setModelsTotalCount(0);
        setModelsTotalPages(1);
      } finally {
        setModelsLoading(false);
      }
    },
    [modelsPageSize, brandSlugFromUrl, router]
  );

  const loadBrandFromSlug = useCallback(
    async (brandSlug: string) => {
      try {
        setLoading(true);
        console.log('Loading brand from URL slug:', brandSlug);

        // Fetch the specific brand by slug
        const response = await fetchEntityBySlug(brandSlug, 'brand');
        const brand = response.results[0];
        console.log('Found brand:', brand);

        if (brand) {
          setSelectedBrand(brand);
          // Load models for this brand
          loadModels(brand, 1);
        } else {
          console.warn('Brand not found for slug:', brandSlug);
          // Fallback to loading all brands
          loadBrands(1);
        }
      } catch (error) {
        console.error('Error loading brand from slug:', error);
        // Fallback to loading all brands
        loadBrands(1);
      }
    },
    [loadModels, loadBrands]
  );

  // Load brand from URL on initial load
  useEffect(() => {
    if (brandSlugFromUrl && !selectedBrand) {
      loadBrandFromSlug(brandSlugFromUrl);
    } else if (!brandSlugFromUrl) {
      loadBrands(1);
    }
  }, [brandSlugFromUrl, loadBrandFromSlug, loadBrands, selectedBrand]);

  useEffect(() => {
    setBrandsCurrentPage(1);
    setSelectedBrand(null); // Clear selected brand when searching
    setModels([]); // Clear models when searching
    loadBrands(1);
  }, [debouncedSearchQuery, loadBrands]);

  const handleBrandClick = (brand: Entity) => {
    setModelsCurrentPage(1);
    loadModels(brand, 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear URL brand parameter when searching
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('brand');
    router.replace(newUrl.pathname + newUrl.search, { scroll: false });

    // Force immediate search without waiting for debounce
    setDebouncedSearchQuery(searchQuery);
    setBrandsCurrentPage(1);
    setSelectedBrand(null);
    setModels([]);
    loadBrands(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setBrandsCurrentPage(1);
    setSelectedBrand(null);
    setModels([]);

    // Clear URL parameters
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('brand');
    router.replace(newUrl.pathname, { scroll: false });

    loadBrands(1);
  };

  // Brands pagination handlers
  const handleBrandsPrevPage = () => {
    if (brandsCurrentPage > 1) {
      loadBrands(brandsCurrentPage - 1);
    }
  };

  const handleBrandsNextPage = () => {
    if (brandsCurrentPage < brandsTotalPages) {
      loadBrands(brandsCurrentPage + 1);
    }
  };

  const handleBrandsPageClick = (page: number) => {
    loadBrands(page);
  };

  // Models pagination handlers
  const handleModelsPrevPage = () => {
    if (modelsCurrentPage > 1 && selectedBrand) {
      loadModels(selectedBrand, modelsCurrentPage - 1);
    }
  };

  const handleModelsNextPage = () => {
    if (modelsCurrentPage < modelsTotalPages && selectedBrand) {
      loadModels(selectedBrand, modelsCurrentPage + 1);
    }
  };

  const handleModelsPageClick = (page: number) => {
    if (selectedBrand) {
      loadModels(selectedBrand, page);
    }
  };

  // Pagination component (same as before)
  const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    totalCount: number;
    onPrevPage: () => void;
    onNextPage: () => void;
    onPageClick: (page: number) => void;
    loading?: boolean;
  }> = ({
    currentPage,
    totalPages,
    totalCount,
    onPrevPage,
    onNextPage,
    onPageClick,
    loading = false,
  }) => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col items-center gap-4 mt-6 p-6">
        {/* Page info */}
        <div className="text-sm text-gray-600">
          Showing page {currentPage} of {totalPages} ({totalCount} total items)
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg 
                     hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed 
                     disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm font-medium text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageClick(page as number)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      currentPage === page
                        ? 'text-blue-600 bg-blue-50 border border-blue-300'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg 
                     hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed 
                     disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  if (loading && brands.length === 0 && !selectedBrand) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">
            {brandSlugFromUrl
              ? `Loading ${brandSlugFromUrl}...`
              : 'Loading brands...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Brands Section */}
        <div className="lg:w-1/2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vehicle Brands
            </h1>
            <p className="text-gray-600">
              {selectedBrand
                ? `Showing models for ${selectedBrand.name}`
                : 'Explore automotive brands and their models'}
            </p>
            {selectedBrand && (
              <button
                onClick={() => {
                  clearSearch();
                  setSelectedBrand(null);
                  setModels([]);
                }}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to all brands
              </button>
            )}
          </div>
          {selectedBrand && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
              {/* Brand Header */}
              <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-3xl font-bold text-white">
                        {selectedBrand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold mb-1">
                        {selectedBrand.name}
                      </h1>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm border border-white/30">
                          {selectedBrand.type}
                        </span>
                        <span className="text-blue-100 text-sm">•</span>
                        <span className="text-blue-100 text-sm font-medium">
                          {modelsTotalCount} models available
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBrand(null);
                      setModels([]);
                      const newUrl = new URL(window.location.href);
                      newUrl.searchParams.delete('brand');
                      router.replace(newUrl.pathname, { scroll: false });
                    }}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"
                    title="Back to brands list"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              </div>

              {/* Brand Description */}
              {selectedBrand.description && (
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        About {selectedBrand.name}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {selectedBrand.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Brand Statistics */}
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Brand Statistics
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/80 rounded-xl p-4 text-center border border-blue-200/50">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {modelsTotalCount}
                    </div>
                    <div className="text-xs text-blue-700 font-medium uppercase tracking-wide">
                      Total Models
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/80 rounded-xl p-4 text-center border border-purple-200/50">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {selectedBrand.hierarchy
                        ? selectedBrand.hierarchy.split(' > ').length
                        : 1}
                    </div>
                    <div className="text-xs text-purple-700 font-medium uppercase tracking-wide">
                      Hierarchy Level
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Hierarchy */}
              {selectedBrand.hierarchy && (
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Brand Hierarchy
                    </h3>
                  </div>

                  <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-200/50">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-mono bg-white px-2 py-1 rounded border text-xs">
                        {selectedBrand.hierarchy}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Quick Actions
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href={`/entities/${selectedBrand.slug}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-all duration-200 border border-blue-200/50 hover:border-blue-300/50"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    View Brand Page
                  </Link>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/entities/${selectedBrand.slug}`;
                        navigator.clipboard.writeText(url);
                        // You could add a toast notification here
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200/50 hover:border-gray-300/50"
                      title="Copy brand URL"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy URL
                    </button>

                    <button
                      onClick={() => {
                        const text = `Check out ${selectedBrand.name} models at ${window.location.origin}/entities/${selectedBrand.slug}`;
                        if (navigator.share) {
                          navigator.share({
                            title: selectedBrand.name,
                            text,
                            url: `${window.location.origin}/entities/${selectedBrand.slug}`,
                          });
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-all duration-200 border border-green-200/50 hover:border-green-300/50"
                      title="Share brand"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Brand Metadata (if available) */}
              <div className="px-6 pb-6">
                <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 font-medium">
                        Entity ID:
                      </span>
                      <span className="ml-2 font-mono text-gray-700">
                        #{selectedBrand.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Slug:</span>
                      <span className="ml-2 font-mono text-gray-700">
                        {selectedBrand.slug}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Show search and brands list only if no brand is selected from URL */}
          {!selectedBrand && (
            <>
              {/* Search */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="p-6">
                  <form onSubmit={handleSearch}>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search brands..."
                          className="w-full px-4 py-2.5 pl-10 bg-gray-50/50 border border-gray-200/60 rounded-xl text-sm 
                                   placeholder:text-gray-400 text-gray-900
                                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:bg-white/80
                                   transition-all duration-200 ease-out"
                        />
                        <svg
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl 
                                 transition-all duration-200 ease-out font-medium text-sm shadow-sm hover:shadow-md
                                 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Search'
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Search status */}
                  {debouncedSearchQuery && (
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {loading
                          ? 'Searching...'
                          : `Searching for "${debouncedSearchQuery}"`}
                      </span>
                      {!loading && brandsTotalCount > 0 && (
                        <span className="text-blue-600 font-medium">
                          {brandsTotalCount} result
                          {brandsTotalCount !== 1 ? 's' : ''} found
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Brands Grid */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="p-6">
                  {brands.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {debouncedSearchQuery
                          ? 'No matching brands found'
                          : 'No brands found'}
                      </h3>
                      <p className="text-gray-500">
                        {debouncedSearchQuery
                          ? `Try adjusting your search for "${debouncedSearchQuery}"`
                          : 'Try adjusting your search criteria'}
                      </p>
                      {debouncedSearchQuery && (
                        <button
                          onClick={clearSearch}
                          className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                                   transition-all duration-200 text-sm font-medium"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {brands.map((brand) => (
                        <div
                          key={brand.id}
                          className="bg-gradient-to-br from-gray-50/50 to-gray-100/30 hover:from-blue-50/50 hover:to-blue-100/30 
                                   rounded-xl border border-gray-200/50 hover:border-blue-200/50 p-4 
                                   transition-all duration-200 cursor-pointer group"
                          onClick={() => handleBrandClick(brand)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                              {brand.name}
                            </h3>
                            <svg
                              className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all duration-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                          {brand.description && (
                            <p className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors line-clamp-2">
                              {brand.description}
                            </p>
                          )}
                          <div className="mt-3 flex items-center text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            Brand
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Brands Pagination */}
                  <Pagination
                    currentPage={brandsCurrentPage}
                    totalPages={brandsTotalPages}
                    totalCount={brandsTotalCount}
                    onPrevPage={handleBrandsPrevPage}
                    onNextPage={handleBrandsNextPage}
                    onPageClick={handleBrandsPageClick}
                    loading={loading}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Models Section */}
        <div className="lg:w-1/2 space-y-6">
          {selectedBrand ? (
            <>
              {/* Models Header */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-blue-100/30 border-b border-blue-200/50">
                  <h2 className="text-xl font-semibold text-blue-900">
                    {selectedBrand.name} Models
                  </h2>
                  <p className="text-sm text-blue-700 mt-1">
                    Available models for {selectedBrand.name}
                  </p>
                </div>

                {modelsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : modelsError ? (
                  <div className="p-6 text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-red-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.118 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Error Loading Models
                    </h3>
                    <p className="text-red-500 text-sm mb-4">{modelsError}</p>
                    <button
                      onClick={() => loadModels(selectedBrand, 1)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                               transition-all duration-200 text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="p-6">
                    {models.length === 0 ? (
                      <div className="text-center py-8">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No models found
                        </h3>
                        <p className="text-gray-500">
                          This brand doesn&apos;t have any models yet
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3">
                          {models.map((model) => (
                            <Link
                              key={model.id}
                              href={`/entities/${selectedBrand.slug}/${model.slug}`}
                              className="block p-4 bg-gray-50/50 hover:bg-blue-50/50 rounded-xl 
                                       transition-all duration-200 border border-gray-200/30 hover:border-blue-200/50 group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                                    {model.name}
                                  </h4>
                                  {model.description && (
                                    <p className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors mt-1 line-clamp-1">
                                      {model.description}
                                    </p>
                                  )}
                                </div>
                                <svg
                                  className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Models Pagination */}
                        <Pagination
                          currentPage={modelsCurrentPage}
                          totalPages={modelsTotalPages}
                          totalCount={modelsTotalCount}
                          onPrevPage={handleModelsPrevPage}
                          onNextPage={handleModelsNextPage}
                          onPageClick={handleModelsPageClick}
                          loading={modelsLoading}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
              <div className="p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Brand
                </h3>
                <p className="text-gray-500">
                  Choose a brand from the left to view its available models
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
