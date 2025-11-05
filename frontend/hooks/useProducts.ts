import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { fetchProducts } from '@/services/apiProducts';
import { Filter, Category, Product } from '@/types/types';
import debounce from 'lodash.debounce';

/**
 * @interface UseProductsProps
 * @description Defines the props required by the useProducts hook.
 */
interface UseProductsProps {
  pageSize: number; // Number of products to fetch per page.
  query: string; // Search query string for filtering products.
  selectedCategory: string; // The currently selected category slug or name.
  categories: Category[]; // List of all available categories.
  setProducts: (products: Product[]) => void; // Callback to update the list of products.
  setTotalPosts: (total: number) => void; // Callback to update the total count of products.
}

/**
 * @interface UseProductsReturn
 * @description Defines the return values from the useProducts hook.
 */
interface UseProductsReturn {
  loading: boolean; // Indicates if data is currently being fetched.
  error: string | null; // Stores any error message during data fetching.
  fetchData: (
    orderBy: string, // Field to order products by (e.g., 'id', 'name').
    page: number, // Current page number to fetch.
    filters: Filter[] // Additional filters to apply.
  ) => Promise<void>;
  debouncedFetchData: (
    orderBy: string,
    page: number,
    filters: Filter[]
  ) => void; // Debounced version of fetchData for performance.
  refetch: () => void; // Function to refetch data using the last known parameters.
}

/**
 * @function useProducts
 * @description A custom React hook for fetching and managing product data with filtering,
 *              pagination, and debouncing capabilities.
 * @param {UseProductsProps} props - The properties for the hook.
 * @returns {UseProductsReturn} - The state and functions for product management.
 */
export const useProducts = ({
  pageSize,
  query,
  selectedCategory,
  categories,
  setProducts,
  setTotalPosts,
}: UseProductsProps): UseProductsReturn => {
  // State to manage loading status during data fetching
  const [loading, setLoading] = useState(false);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);

  // useRef to store the current fetching parameters, allowing refetch without
  // recreating the refetch function on every render.
  const currentParamsRef = useRef<{
    orderBy: string;
    page: number;
    filters: Filter[];
  }>({
    orderBy: 'id',
    page: 1,
    filters: [],
  });

  /**
   * @function fetchData
   * @description Asynchronously fetches product data from the API based on provided parameters.
   *              It combines query, category, and other filters, enriches product data,
   *              and updates the component's state.
   * @param {string} orderBy - The field to order the products by.
   * @param {number} page - The page number to fetch.
   * @param {Filter[]} filters - An array of additional filters.
   */
  const fetchData = useCallback(
    async (orderBy: string, page: number, filters: Filter[]) => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any previous errors

        // Store current parameters for potential refetch operations
        currentParamsRef.current = { orderBy, page, filters };

        // Construct a query filter if a search query is provided
        const queryFilter = query.trim()
          ? [{ type: 'query', id: 0, name: query.trim() }]
          : [];

        // Construct a category filter if a category is selected
        let categoryFilter: Filter[] = [];
        if (
          selectedCategory &&
          selectedCategory.trim() &&
          categories.length > 0
        ) {
          // Find the category object by its slug or name
          const category = categories.find(
            (cat) =>
              cat.slug === selectedCategory.trim() ||
              cat.name === selectedCategory.trim()
          );

          if (category) {
            categoryFilter = [
              { type: 'categories', id: category.id, name: category.name },
            ];
          }
        }

        // Combine all filters, ensuring no duplicate filters are applied
        const combinedFilters = [
          ...filters,
          ...queryFilter,
          ...categoryFilter,
        ].filter(
          (filter, index, self) =>
            index ===
            self.findIndex((f) => f.type === filter.type && f.id === filter.id)
        );

        // Call the API to fetch products
        const data = await fetchProducts(
          orderBy,
          page,
          pageSize,
          combinedFilters
        );

        // Process fetched data
        if (data && Array.isArray(data.results)) {
          // Enrich each product with its category names for easier display
          const enrichedProducts = data.results.map(
            (product: { categories: any[] }) => ({
              ...product,
              categoryNames: product.categories
                .map(
                  (catId) => categories.find((cat) => cat.id === catId)?.name
                )
                .filter(Boolean), // Filter out any undefined names
            })
          );

          setProducts(enrichedProducts); // Update products state
          setTotalPosts(data.count || 0); // Update total posts count
        } else {
          // Handle unexpected data format from the API
          console.error('❌ Unexpected data format:', data);
          setError('Invalid data format received');
          setProducts([]);
          setTotalPosts(0);
        }
      } catch (err) {
        // Catch and handle any errors during the API call
        console.error('❌ Error fetching products:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch products'
        );
        setProducts([]);
        setTotalPosts(0);
      } finally {
        setLoading(false); // Always set loading to false after fetch attempt
      }
    },
    // Dependencies for useCallback: re-create fetchData if any of these change
    [pageSize, query, selectedCategory, categories, setProducts, setTotalPosts]
  );

  /**
   * @function debouncedFetchData
   * @description A memoized, debounced version of fetchData. This prevents fetchData
   *              from being called too frequently (e.g., on rapid key presses in a search bar).
   *              It will only execute fetchData after a 300ms pause in calls.
   */
  const debouncedFetchData = useMemo(
    () =>
      debounce((orderBy: string, page: number, filters: Filter[]) => {
        fetchData(orderBy, page, filters);
      }, 300),
    [fetchData] // Re-create debounced function only if fetchData itself changes
  );

  /**
   * @function refetch
   * @description A memoized callback to refetch data using the last stored parameters.
   *              Useful for refreshing data without changing filters or pagination.
   */
  const refetch = useCallback(() => {
    const { orderBy, page, filters } = currentParamsRef.current;
    fetchData(orderBy, page, filters);
  }, [fetchData]); // Re-create refetch if fetchData changes

  /**
   * @effect
   * @description Triggers a data fetch whenever the search query, selected category,
   *              or categories list changes. It uses the debounced version to prevent
   *              excessive API calls.
   */
  useEffect(() => {
    // Only fetch if categories are loaded or a search query is present
    if (categories.length > 0 || query.trim()) {
      // Use the filters from the last successful fetch, or an empty array if none
      const currentFilters = currentParamsRef.current.filters || [];
      // Trigger a debounced fetch, resetting to the first page with default sorting
      debouncedFetchData('id', 1, currentFilters);
    }
  }, [query, selectedCategory, categories, debouncedFetchData]); // Dependencies for useEffect

  // Return the state and functions provided by the hook
  return {
    loading,
    error,
    fetchData,
    debouncedFetchData,
    refetch,
  };
};

export default useProducts;