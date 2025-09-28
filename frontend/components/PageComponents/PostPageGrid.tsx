'use client';

import React, { useCallback, useEffect, useState } from 'react';
import NextImage from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Post, Category } from '@/types/types';
import Link from 'next/link';
import HtmlContent from '@/helpers/content';
import { getPublicImageUrl } from '@/helpers/media';
import SafeImage from '@/components/UI/SafeImage';
import ArrowRotateIcon from '@/components/UI/Icons/ArrowRotate';
import ChapterIcon from '../UI/Icons/Chapter';
import BookIcon from '../UI/Icons/Book';
import LibraryIcon from '../UI/Icons/Library';
import FilterIcon from '../UI/Icons/Filter';
import { fetchPosts, fetchCategories } from '@/services/api';

const Posts: React.FC<{
  filter: string;
}> = ({ filter }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(10); // Fixed page size for pagination
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Add function to toggle category expansion
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Initialize expanded categories from URL params
  useEffect(() => {
    const subcategoryParam = searchParams?.get('subcategory');
    if (subcategoryParam) {
      // Find parent category and expand it
      categories.forEach((cat) => {
        if (cat.children?.some((child) => child.slug === subcategoryParam)) {
          setExpandedCategories((prev) => new Set(prev).add(cat.id));
        }
      });
    }
  }, [searchParams, categories]);

  // Initialize search from URL params
  useEffect(() => {
    const searchParam = searchParams?.get('query') || '';
    setSearchQuery(searchParam);
  }, [searchParams]);

  // Handle pagination for filtered results
  useEffect(() => {
    if (selectedCategory) {
      const loadFilteredPage = async () => {
        setLoading(true);
        try {
          const searchParam = searchParams?.get('query') || '';
          const data = await fetchPosts(
            currentPage,
            pageSize,
            `?category=${selectedCategory}&query=${searchParam}`,
            'post'
          );
          setFilteredPosts(data.results);
          setTotalCount(data.count);
          setTotalPages(Math.ceil(data.count / pageSize));
          setHasNext(!!data.next);
          setHasPrevious(!!data.previous);
        } catch (error) {
          console.error('Error fetching filtered page:', error);
        } finally {
          setLoading(false);
        }
      };

      if (currentPage > 1) {
        loadFilteredPage();
      }
    }
  }, [currentPage, selectedCategory, pageSize, searchParams]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchPosts(currentPage, pageSize, filter, 'post');
        setPosts(data.results);
        setFilteredPosts(data.results);

        // Update pagination info
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / pageSize));
        setHasNext(!!data.next);
        setHasPrevious(!!data.previous);

        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${filter} posts:`, error);
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const data = await fetchCategories(1, 20, 14);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    loadPosts();
    loadCategories();
  }, [filter, currentPage, pageSize]);

  const handleCategoryFilter = useCallback(
    async (categorySlug: string) => {
      setSelectedCategory(categorySlug);
      setCurrentPage(1); // Reset to first page when filtering
      setLoading(true);

      try {
        // Get current search query
        const searchParam = searchParams?.get('query') || '';

        // Pass search query along with category filter
        const data = await fetchPosts(
          currentPage,
          pageSize,
          `?category=${categorySlug}&query=${searchParam}`,
          'post'
        );
        setFilteredPosts(data.results);

        // Update pagination info for filtered results
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / pageSize));
        setHasNext(!!data.next);
        setHasPrevious(!!data.previous);
      } catch (error) {
        console.error(
          'Backend filtering failed, using client-side filtering:',
          error
        );
        // Fallback to client-side filtering with search
        let filtered = posts.filter((post) =>
          post.categories?.some((cat) => {
            const category = categories.find(
              (c) => c.id === (typeof cat === 'number' ? cat : cat.id)
            );
            return category?.slug === categorySlug;
          })
        );

        // Apply search filter if there's a search query
        const searchString = searchParams?.get('query')?.toLowerCase() || '';
        if (searchString) {
          filtered = filtered.filter(
            (post) =>
              post.title.toLowerCase().includes(searchString) ||
              post.slug?.toLowerCase().includes(searchString) ||
              post.description.toLowerCase().includes(searchString)
          );
        }

        setFilteredPosts(filtered);

        // Update pagination for client-side filtered results
        setTotalCount(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
        setHasNext(false);
        setHasPrevious(false);
      } finally {
        setLoading(false);
      }
    },
    [posts, categories, pageSize, currentPage, searchParams]
  );

  // Initialize category from URL params
  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    const subcategoryParam = searchParams?.get('subcategory');

    if (subcategoryParam && categories.length > 0) {
      // If there's a subcategory, use it as the selected category
      if (selectedCategory !== subcategoryParam) {
        handleCategoryFilter(subcategoryParam);
      }
    } else if (categoryParam && categories.length > 0) {
      // If there's only a category, use it as the selected category
      if (selectedCategory !== categoryParam) {
        handleCategoryFilter(categoryParam);
      }
    } else if (!categoryParam && !subcategoryParam && selectedCategory) {
      setSelectedCategory(null);
      setCurrentPage(1);
      setFilteredPosts(posts);
    }
  }, [searchParams, categories, posts, selectedCategory, handleCategoryFilter]);

  const handleCategoryClick = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    // Find if this is a subcategory
    let parentCategory: Category | undefined;
    let isSubcategory = false;

    categories.forEach((cat) => {
      if (cat.children?.some((child) => child.slug === categorySlug)) {
        parentCategory = cat;
        isSubcategory = true;
      }
    });

    if (isSubcategory && parentCategory) {
      // If it's a subcategory, set both parent and subcategory
      params.set('category', parentCategory.slug);
      params.set('subcategory', categorySlug);
    } else {
      // If it's a parent category, only set category and remove subcategory
      params.set('category', categorySlug);
      params.delete('subcategory');
    }

    router.push(`?${params.toString()}`);
  };

  const handleShowAll = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.delete('category');
    params.delete('subcategory');
    setCurrentPage(1);
    setSelectedCategory(null);
    router.push(`/posts`);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      handlePageChange(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const featuredPosts = filteredPosts.filter((post) => post.is_featured);
  const popularPosts = [...filteredPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3 space-y-10">
          {selectedCategory && (
            <div className="flex justify-between border-b mb-8 pb-4">
              {/* Filter indicator */}
              {selectedCategory && (
                <>
                  <div className="flex items-center gap-3">
                    {/* Modern filter chip */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
                      <FilterIcon className="w-4 h-4" />
                      <span>
                        {(() => {
                          const categoryParam = searchParams?.get('category');
                          const subcategoryParam =
                            searchParams?.get('subcategory');

                          if (subcategoryParam) {
                            const parentCat = categories.find(
                              (cat) => cat.slug === categoryParam
                            );
                            const subCat = categories
                              .flatMap((cat) => cat.children || [])
                              .find((child) => child.slug === subcategoryParam);
                            return (
                              <>
                                <span className="font-bold">
                                  {parentCat?.name}
                                </span>
                                <span className="font-normal">
                                  {' '}
                                  / {subCat?.name}
                                </span>
                              </>
                            );
                          } else {
                            return (
                              <span className="font-bold">
                                {
                                  categories.find(
                                    (cat) => cat.slug === selectedCategory
                                  )?.name
                                }
                              </span>
                            );
                          }
                        })()}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold ml-1">
                        {filteredPosts.length}
                      </span>

                      {/* Back button - only show when viewing a subcategory */}
                      {searchParams?.get('subcategory') && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(
                              searchParams?.toString() ?? ''
                            );
                            params.delete('subcategory');
                            router.push(`?${params.toString()}`);
                          }}
                          className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                          title="Go back to parent category"
                        >
                          <svg
                            className="w-3 h-3"
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
                      )}

                      <button
                        onClick={handleShowAll}
                        className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                        title="View all posts"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {loading && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                        Filtering...
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleShowAll}
                      className={`block mb-3 text-sm ${
                        !selectedCategory
                          ? 'text-blue-600'
                          : 'hover:text-blue-600'
                      }`}
                    >
                      All Categories
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Add this after the category filter chip */}
          {searchParams?.get('query') && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-sm font-medium text-green-700 dark:text-green-300">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search: `{searchParams.get('query')}`</span>
              <button
                onClick={() => {
                  const params = new URLSearchParams(
                    searchParams?.toString() ?? ''
                  );
                  params.delete('query');
                  router.push(`?${params.toString()}`);
                }}
                className="ml-1 p-0.5 hover:bg-green-200 dark:hover:bg-green-800 rounded-full transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
          {/* Featured Section */}
          {featuredPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Featured Posts</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {featuredPosts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.slug}`}>
                    <div className="group overflow-hidden rounded-lg shadow hover:shadow-lg transition">
                      <div className="aspect-[4/3] w-full">
                        <SafeImage
                          alt={post.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          images={[
                            {
                              image_path: getPublicImageUrl(
                                'posts',
                                post.id,
                                post.images?.[0]?.image_path
                              ),
                            },
                          ]}
                          width={400}
                          height={300}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold group-hover:text-blue-600">
                          {post.title}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                          <HtmlContent htmlContent={post.description} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Posts */}
          <section>
            <div className="space-y-6">
              {filteredPosts.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No posts available
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {selectedCategory
                      ? 'No posts found in this category. Try browsing other categories or check back later.'
                      : 'No posts are currently available. Check back later for new content.'}
                  </p>
                  {selectedCategory && (
                    <button
                      onClick={handleShowAll}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      View All Posts
                    </button>
                  )}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col sm:flex-row border-b pb-4 gap-4"
                  >
                    <Link
                      href={`/posts/${post.slug}`}
                      className="relative block w-full sm:w-60 h-40 flex-shrink-0"
                    >
                      <SafeImage
                        alt={post.title}
                        className="h-full w-full object-cover rounded"
                        images={[
                          {
                            image_path: getPublicImageUrl(
                              'posts',
                              post.id,
                              post.images?.[0]?.image_path
                            ),
                          },
                        ]}
                        fill
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="text-xs text-blue-600 uppercase mb-2">
                        {post.categories?.map((category, i) => (
                          <span key={i}>
                            {category.name}
                            {i < post.categories.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      <Link href={`/posts/${post.slug}`}>
                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                      </Link>
                      <div className="text-sm text-gray-500 line-clamp-3">
                        <HtmlContent htmlContent={post.description} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Pagination */}
          {/* Always render pagination container to prevent layout shift */}
          <div className="min-h-[72px] flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
            {totalPages > 1 ? (
              <>
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!hasPrevious}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!hasNext}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalCount)}
                      </span>{' '}
                      of <span className="font-medium">{totalCount}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={handlePreviousPage}
                        disabled={!hasPrevious}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === '...' ? (
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                              ...
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(page as number)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                currentPage === page
                                  ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                      <button
                        onClick={handleNextPage}
                        disabled={!hasNext}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-sm text-gray-500">
                  No pagination needed
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-1/3 space-y-8">
          {/* Search Bar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const params = new URLSearchParams(
                    searchParams?.toString() ?? ''
                  );

                  if (searchQuery.trim()) {
                    params.set('query', searchQuery.trim());
                  } else {
                    params.delete('query');
                  }

                  router.push(`?${params.toString()}`);
                }}
                className="relative"
              >
                <div className="relative flex items-center">
                  {/* Search Icon */}
                  <div className="absolute left-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
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
                  </div>

                  {/* Input Field */}
                  <input
                    type="text"
                    placeholder="Search technical guides..."
                    className="w-full pl-12 pr-20 py-3.5 bg-gray-50/50 border border-gray-200/60 rounded-xl text-sm 
                   placeholder:text-gray-400 text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:bg-white/80
                   transition-all duration-200 ease-out"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                   transition-all duration-200 ease-out font-medium text-sm
                   shadow-sm hover:shadow-md active:scale-95"
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>

                  {/* Clear Button - shows when there's text */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        const params = new URLSearchParams(
                          searchParams?.toString() ?? ''
                        );
                        params.delete('query');
                        router.push(`?${params.toString()}`);
                      }}
                      className="absolute right-16 p-1 hover:bg-gray-200/60 rounded-full transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Search suggestions or recent searches could go here */}
                {searchQuery.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Quick Actions
                      </div>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50/60 rounded-lg transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                        <span className="text-sm">
                          Search for
                          <span className="font-medium">
                            `&quot;{searchQuery}&quot;
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
          {/* Categories */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                Technical Library
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Browse Handbooks & Chapters
              </p>
            </div>

            <div className="p-2">
              {/* All Categories Button */}
              <button
                onClick={handleShowAll}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${
                  !selectedCategory
                    ? 'bg-blue-50/80 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50/60'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <LibraryIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Complete Library</span>
              </button>

              {/* Category List */}
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isActive = searchParams?.get('category') === cat.slug;
                  const hasActiveChild = cat.children?.some(
                    (child) => searchParams?.get('subcategory') === child.slug
                  );
                  const isExpanded = expandedCategories.has(cat.id);

                  return (
                    <div key={cat.id}>
                      {/* Parent Category */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleCategoryClick(cat.slug)}
                          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            isActive && !searchParams?.get('subcategory')
                              ? 'font-medium'
                              : hasActiveChild
                                ? 'bg-gray-50/60 text-gray-800 font-medium'
                                : 'text-gray-700'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isActive || hasActiveChild
                                ? 'bg-gradient-to-br from-orange-400 to-orange-500'
                                : 'bg-gradient-to-br from-gray-400 to-gray-500'
                            }`}
                          >
                            <BookIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block">
                              {cat.name}
                            </span>
                            {cat.children && cat.children.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {cat.children.length} chapters
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Clickable Arrow Button */}
                        {cat.children && cat.children.length > 0 && (
                          <button
                            onClick={() => toggleCategoryExpansion(cat.id)}
                            className="p-2 hover:bg-gray-100/60 rounded-lg transition-all duration-200 mr-2"
                          >
                            <ArrowRotateIcon isExpanded={isExpanded} />
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {cat.children &&
                        cat.children.length > 0 &&
                        isExpanded && (
                          <div className="ml-11 space-y-1 mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                            {cat.children.map((sub) => {
                              const isSubActive =
                                searchParams?.get('subcategory') === sub.slug;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => handleCategoryClick(sub.slug)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                                    isSubActive
                                      ? 'bg-blue-50/80 text-blue-700 font-medium'
                                      : 'text-gray-600 hover:bg-gray-50/60 hover:text-gray-800'
                                  }`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                      isSubActive
                                        ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                                        : 'bg-gradient-to-br from-gray-300 to-gray-400'
                                    }`}
                                  >
                                    <ChapterIcon className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-sm">
                                    Ch. {sub.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Popular */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                Most Popular
              </h2>
            </div>
            <div className="divide-y divide-gray-100/70">
              {popularPosts.map((post, index) => (
                <div key={post.id} className="group">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-center gap-4 px-4 py-6 hover:bg-gray-50/60 transition-all duration-300 ease-out"
                  >
                    {/* Ranking Badge */}
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium shadow-sm">
                      {index + 1}
                    </div>

                    {/* Image */}
                    <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <SafeImage
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        images={[
                          {
                            image_path: getPublicImageUrl(
                              'posts',
                              post.id,
                              post.images?.[0]?.image_path
                            ),
                          },
                        ]}
                        fallback="/images/placeholder-post.jpg"
                        fill
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-snug mb-1">
                        {post.title}
                      </h3>

                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="font-medium">
                            {post.views || 0} views
                          </span>
                        </div>

                        {/* Category */}
                        {post.categories?.map((category, i) => (
                          <span key={i}>
                            {category.name}
                            {i < post.categories.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg
                        className="w-4 h-4 text-gray-400"
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
                </div>
              ))}
            </div>
          </div>
          {/* Ad */}
          <div className="text-sm">
            <NextImage
              className="mx-auto w-full"
              src="/images/ads/250.jpg"
              alt="advertisement area"
              width={250}
              height={200}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Posts;
