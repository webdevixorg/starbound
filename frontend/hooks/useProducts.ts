import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { fetchProducts } from '@/services/apiProducts';
import { Filter, Category, Product } from '@/types/types';
import debounce from 'lodash.debounce';

interface UseProductsProps {
  pageSize: number;
  query: string;
  selectedCategory: string;
  categories: Category[];
  setProducts: (products: Product[]) => void;
  setTotalPosts: (total: number) => void;
}

interface UseProductsReturn {
  loading: boolean;
  error: string | null;
  fetchData: (
    orderBy: string,
    page: number,
    filters: Filter[]
  ) => Promise<void>;
  debouncedFetchData: (
    orderBy: string,
    page: number,
    filters: Filter[]
  ) => void;
  refetch: () => void;
}

export const useProducts = ({
  pageSize,
  query,
  selectedCategory,
  categories,
  setProducts,
  setTotalPosts,
}: UseProductsProps): UseProductsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store current parameters for refetch
  const currentParamsRef = useRef<{
    orderBy: string;
    page: number;
    filters: Filter[];
  }>({
    orderBy: 'id',
    page: 1,
    filters: [],
  });

  const fetchData = useCallback(
    async (orderBy: string, page: number, filters: Filter[]) => {
      try {
        setLoading(true);
        setError(null);

        // Store current parameters
        currentParamsRef.current = { orderBy, page, filters };

        // Build query filter from search input
        const queryFilter = query.trim()
          ? [{ type: 'query', id: 0, name: query.trim() }]
          : [];

        // Build category filter from selected category
        let categoryFilter: Filter[] = [];
        if (
          selectedCategory &&
          selectedCategory.trim() &&
          categories.length > 0
        ) {
          // Find category by slug or name
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

        // Combine all filters (avoid duplicates)
        const combinedFilters = [
          ...filters,
          ...queryFilter,
          ...categoryFilter,
        ].filter(
          (filter, index, self) =>
            index ===
            self.findIndex((f) => f.type === filter.type && f.id === filter.id)
        );

        const data = await fetchProducts(
          orderBy,
          page,
          pageSize,
          combinedFilters
        );

        if (data && Array.isArray(data.results)) {
          // Enrich products with category names
          const enrichedProducts = data.results.map(
            (product: { categories: any[] }) => ({
              ...product,
              categoryNames: product.categories
                .map(
                  (catId) => categories.find((cat) => cat.id === catId)?.name
                )
                .filter(Boolean),
            })
          );

          setProducts(enrichedProducts);
          setTotalPosts(data.count || 0);
        } else {
          console.error('❌ Unexpected data format:', data);
          setError('Invalid data format received');
          setProducts([]);
          setTotalPosts(0);
        }
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch products'
        );
        setProducts([]);
        setTotalPosts(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, query, selectedCategory, categories, setProducts, setTotalPosts]
  );

  // Debounced version of fetchData
  const debouncedFetchData = useMemo(
    () =>
      debounce((orderBy: string, page: number, filters: Filter[]) => {
        fetchData(orderBy, page, filters);
      }, 300),
    [fetchData]
  );

  // Refetch function using stored parameters
  const refetch = useCallback(() => {
    const { orderBy, page, filters } = currentParamsRef.current;
    fetchData(orderBy, page, filters);
  }, [fetchData]);

  // Auto-fetch when query or category changes
  useEffect(() => {
    // Only fetch if we have categories loaded OR if there's a search query
    if (categories.length > 0 || query.trim()) {
      // Use current filters from the component
      const currentFilters = currentParamsRef.current.filters || [];
      debouncedFetchData('id', 1, currentFilters); // Reset to first page with default sorting
    }
  }, [query, selectedCategory, categories, debouncedFetchData]);

  return {
    loading,
    error,
    fetchData,
    debouncedFetchData,
    refetch,
  };
};

export default useProducts;
