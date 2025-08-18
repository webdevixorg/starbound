'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchBrands,
  fetchModelsByBrandId,
  Entity,
  EntitiesResponse,
} from '@/services/entities';

const EntitiesPage: React.FC = () => {
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
  const [brandsPageSize] = useState(8);

  // Models pagination
  const [modelsCurrentPage, setModelsCurrentPage] = useState(1);
  const [modelsTotalPages, setModelsTotalPages] = useState(1);
  const [modelsTotalCount, setModelsTotalCount] = useState(0);
  const [modelsPageSize] = useState(10);

  // Debounce search to avoid too many API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setBrandsCurrentPage(1);
    setSelectedBrand(null); // Clear selected brand when searching
    setModels([]); // Clear models when searching
    loadBrands(1);
  }, [debouncedSearchQuery]);

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
          brandList = response as Entity[];
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
    [debouncedSearchQuery, brandsPageSize]
  );

  const loadModels = async (brand: Entity, page: number = 1) => {
    try {
      console.log('Loading models for brand:', brand, 'page:', page);

      if (page === 1) {
        setModelsLoading(true);
        setSelectedBrand(brand);
        setModels([]);
        setModelsError(null);
      }

      const response: EntitiesResponse = await fetchModelsByBrandId(brand.id, {
        page,
        pageSize: modelsPageSize,
      });

      console.log('Models response:', response);

      let modelList: Entity[] = [];
      if (response && response.results && Array.isArray(response.results)) {
        modelList = response.results;
        setModelsTotalCount(response.count || 0);
        setModelsTotalPages(Math.ceil((response.count || 0) / modelsPageSize));
      } else if (response && Array.isArray(response)) {
        modelList = response as Entity[];
        setModelsTotalCount(modelList.length);
        setModelsTotalPages(1);
      } else if (response && response.data && Array.isArray(response.data)) {
        modelList = response.data as Entity[];
        setModelsTotalCount(modelList.length);
        setModelsTotalPages(1);
      }

      console.log('Processed models:', modelList);

      setModels(modelList);
      setModelsCurrentPage(page);
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
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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

  // Pagination component
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
      <div className="flex flex-col items-center gap-4 mt-6">
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

  if (loading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Brands Section */}
      <div className="lg:w-1/2 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vehicle Brands
          </h1>
          <p className="text-gray-600">
            Explore automotive brands and their models
          </p>
        </div>

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
                    className={`bg-gradient-to-br from-gray-50/50 to-gray-100/30 hover:from-blue-50/50 hover:to-blue-100/30 
                               rounded-xl border border-gray-200/50 hover:border-blue-200/50 p-4 
                               transition-all duration-200 cursor-pointer group
                               ${selectedBrand?.id === brand.id ? 'ring-2 ring-blue-500/20 border-blue-500/30 from-blue-50/50 to-blue-100/30' : ''}`}
                    onClick={() => {
                      setModelsCurrentPage(1);
                      loadModels(brand, 1);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                        {brand.name}
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all duration-200
                                   ${selectedBrand?.id === brand.id ? 'rotate-90 text-blue-500' : ''}`}
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

                  {/* Debug info */}
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                    <strong>Debug:</strong> Found {models.length} models for{' '}
                    {selectedBrand.name} (Page {modelsCurrentPage} of{' '}
                    {modelsTotalPages})
                  </div>
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
  );
};

export default EntitiesPage;
