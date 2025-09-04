'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchIcon from '@/components/UI/Icons/Search';
import { fetchCategories } from '@/services/api';
import { Category } from '@/types/types';

// Custom debounce function to replace lodash
function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
): (...args: T) => void {
  let timeout: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string, category?: string) => void;
  variant?: 'default' | 'compact' | 'mobile';
}

// Separate component to handle search params
function SearchBarContent({
  className = '',
  placeholder = 'Search products, brands, categories...',
  autoFocus = false,
  onSearch,
  variant = 'default',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [justCleared, setJustCleared] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize from URL params
  useEffect(() => {
    if (!searchParams) return;

    const urlQuery = searchParams.get('query') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlSubCategory = searchParams.get('subcategory') || '';

    setQuery(urlQuery.trim());
    setSelectedCategory(urlCategory.trim());
    setSelectedSubCategory(urlSubCategory.trim());
  }, [searchParams]);

  // Focus input if autoFocus is enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history.slice(0, 5)); // Keep only last 5 searches
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  // Fetch categories with error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchCategories(1, 20); // Fetch more categories
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        formRef.current &&
        !formRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Debounced search suggestions
  const debouncedShowSuggestions = useMemo(
    () =>
      debounce((value: string) => {
        if (value.trim().length > 0) {
          setShowSuggestions(true);
        }
      }, 300),
    [] // No dependencies needed for this debounced function
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedShowSuggestions(value);
    },
    [debouncedShowSuggestions]
  );

  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const currentHistory = JSON.parse(
        localStorage.getItem('searchHistory') || '[]'
      );
      const newHistory = [
        searchQuery.trim(),
        ...currentHistory.filter((item: string) => item !== searchQuery.trim()),
      ].slice(0, 5);

      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedQuery = query.trim();
      const trimmedCategory = selectedCategory.trim();
      const trimmedSubCategory = selectedSubCategory.trim();

      if (!trimmedQuery) {
        inputRef.current?.focus();
        return;
      }

      // Save to history
      saveToHistory(trimmedQuery);

      // Close dropdowns
      setMenuOpen(false);
      setShowSuggestions(false);

      // Custom onSearch callback
      if (onSearch) {
        onSearch(trimmedQuery, trimmedCategory || undefined);
        return;
      }

      // Default navigation
      const params = new URLSearchParams({ query: trimmedQuery });
      if (trimmedCategory) {
        params.set('category', trimmedCategory);
      }
      if (trimmedSubCategory) {
        params.set('subcategory', trimmedSubCategory);
      }

      router.push(`/shop?${params.toString()}`);
    },
    [
      query,
      selectedCategory,
      selectedSubCategory,
      onSearch,
      router,
      saveToHistory,
    ]
  );

  const handleCategorySelect = useCallback((categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setSelectedSubCategory(''); // Clear subcategory when main category is selected
    setMenuOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleSubCategorySelect = useCallback(
    (categorySlug: string, subcategorySlug: string) => {
      setSelectedCategory(categorySlug); // Keep the main category for URL
      setSelectedSubCategory(subcategorySlug);
      setMenuOpen(false);
      inputRef.current?.focus();
    },
    []
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      setShowSuggestions(false);

      // Trigger search immediately
      const trimmedCategory = selectedCategory.trim();
      const trimmedSubCategory = selectedSubCategory.trim();

      saveToHistory(suggestion);

      if (onSearch) {
        onSearch(suggestion, trimmedCategory || undefined);
        return;
      }

      const params = new URLSearchParams({ query: suggestion });
      if (trimmedCategory) {
        params.set('category', trimmedCategory);
      }

      if (trimmedSubCategory) {
        params.set('subcategory', trimmedSubCategory);
      }

      router.push(`/shop?${params.toString()}`);
    },
    [selectedCategory, selectedSubCategory, onSearch, router, saveToHistory]
  );

  const selectedCategoryName = useMemo(() => {
    // If a subcategory is selected, show the subcategory name
    if (selectedSubCategory) {
      // Find the category that contains this subcategory
      for (const category of categories) {
        if (category.children) {
          const subcategory = category.children.find(
            (sub) => sub.slug.trim() === selectedSubCategory
          );
          if (subcategory) {
            return subcategory.name;
          }
        }
      }
      return 'Unknown Subcategory';
    }

    // If a main category is selected, show the category name
    if (selectedCategory) {
      const category = categories.find(
        (c) => c.slug.trim() === selectedCategory
      );
      return category?.name || 'Unknown Category';
    }

    // Default to "All Categories"
    return 'All Categories';
  }, [selectedCategory, selectedSubCategory, categories]);

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return searchHistory;
    return searchHistory.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, searchHistory]);

  // Responsive classes based on variant
  const containerClasses = useMemo(() => {
    const base = 'w-full relative';
    switch (variant) {
      case 'compact':
        return `${base} h-10`;
      case 'mobile':
        return `${base} h-12`;
      default:
        return `${base} h-11 lg:h-12`;
    }
  }, [variant]);

  const inputClasses = useMemo(() => {
    const base =
      'w-full h-full flex items-center bg-white border border-gray-300 rounded-lg transition-all duration-200';
    return `${base} ${className}`;
  }, [className]);

  return (
    <div className={containerClasses}>
      <form ref={formRef} onSubmit={handleSearch} className="w-full h-full">
        <div className={inputClasses}>
          {/* Categories Dropdown */}
          {variant !== 'mobile' && (
            <>
              <div className="relative flex items-center px-3 lg:px-4 min-w-0 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center justify-between text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors min-w-0"
                  aria-label="Select category"
                  aria-expanded={menuOpen}
                  aria-haspopup="listbox"
                >
                  <span className="truncate max-w-24 lg:max-w-32">
                    {selectedCategoryName}
                  </span>
                  <svg
                    className={`ml-1 lg:ml-2 w-3 h-3 transition-transform duration-200 flex-shrink-0 ${
                      menuOpen ? 'rotate-180' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Category Dropdown */}
                {menuOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 z-50 w-48 lg:w-56 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    role="listbox"
                  >
                    {isLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Loading...
                      </div>
                    ) : error ? (
                      <div className="px-4 py-3 text-sm text-red-500">
                        {error}
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            handleCategorySelect('');
                            setSelectedSubCategory(''); // Clear subcategory as well
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                          role="option"
                          aria-selected={
                            !selectedCategory && !selectedSubCategory
                          }
                        >
                          All Categories
                        </button>
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            {/* Main Category */}
                            <button
                              type="button"
                              onClick={() =>
                                handleCategorySelect(category.slug.trim())
                              }
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between group"
                              role="option"
                              aria-selected={
                                selectedCategory === category.slug.trim() &&
                                !selectedSubCategory
                              }
                            >
                              <span className="flex items-center">
                                {category.name}
                              </span>
                              {category.children &&
                                category.children.length > 0 && (
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                      {category.children.length}
                                    </span>
                                  </div>
                                )}
                            </button>

                            {/* Subcategories */}
                            {category.children &&
                              category.children.length > 0 && (
                                <div className="bg-gradient-to-r from-gray-50 to-gray-25 border-l-2 border-blue-200 ml-4">
                                  {category.children.map((subcategory) => (
                                    <button
                                      key={`${category.id}-${subcategory.id}`}
                                      type="button"
                                      onClick={() =>
                                        handleSubCategorySelect(
                                          `${category.slug.trim()}`,
                                          `${subcategory.slug.trim()}`
                                        )
                                      }
                                      className="w-full text-left pl-6 pr-4 py-2 text-sm text-gray-700 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none relative border-b border-gray-100 last:border-b-0 group"
                                      role="option"
                                      aria-selected={
                                        selectedCategory ===
                                          category.slug.trim() &&
                                        selectedSubCategory ===
                                          subcategory.slug.trim()
                                      }
                                    >
                                      <div className="flex items-center">
                                        <span className="group-hover:text-blue-700">
                                          {subcategory.name}
                                        </span>
                                      </div>
                                      {/* Connection line */}
                                      <div className="absolute left-2 top-0 w-4 h-full flex items-center">
                                        <div className="w-2 h-px bg-gray-300"></div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-300"></div>
            </>
          )}

          {/* Search Input */}
          <div className="flex-1 px-3 lg:px-4 relative">
            <input
              ref={inputRef}
              type="text"
              className="w-full h-full border-none outline-none bg-transparent text-sm lg:text-base placeholder-gray-500 pr-8"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                if (
                  !justCleared &&
                  (query.trim() || searchHistory.length > 0)
                ) {
                  setShowSuggestions(true);
                }
              }}
              autoComplete="off"
              spellCheck="false"
              aria-label="Search input"
            />

            {/* Clear Button */}
            {query.trim() && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setShowSuggestions(false);
                  setJustCleared(true);

                  // Trigger search with empty query
                  const params = new URLSearchParams();
                  if (selectedCategory.trim()) {
                    params.set('category', selectedCategory.trim());
                  }
                  if (selectedSubCategory.trim()) {
                    params.set('subcategory', selectedSubCategory.trim());
                  }

                  if (onSearch) {
                    onSearch('', selectedCategory.trim() || undefined);
                  } else {
                    router.push(
                      `/shop${params.toString() ? '?' + params.toString() : ''}`
                    );
                  }

                  // Focus back to input after a brief delay to prevent onFocus from showing suggestions
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                    // Reset the flag after focus
                    setTimeout(() => setJustCleared(false), 50);
                  }, 100);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Search Suggestions */}
            {showSuggestions && (query.trim() || searchHistory.length > 0) && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {query.trim() && (
                  <div className="px-4 py-2 text-xs text-gray-500 border-b">
                    Search for `&quot;{query}&quot;`
                  </div>
                )}

                {filteredSuggestions.length > 0 && (
                  <>
                    {!query.trim() && (
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">
                        Recent searches
                      </div>
                    )}
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {suggestion}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center px-4 lg:px-6 h-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-lg transition-colors duration-200"
            aria-label="Search"
            disabled={!query.trim()}
          >
            <SearchIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="ml-2 hidden lg:inline text-sm">Search</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// Main component with Suspense wrapper
const SearchBar: React.FC<SearchBarProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-11 lg:h-12 bg-gray-100 rounded-lg animate-pulse" />
      }
    >
      <SearchBarContent {...props} />
    </Suspense>
  );
};

export default SearchBar;
