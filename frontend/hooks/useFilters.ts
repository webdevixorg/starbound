import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { fetchSubCategories } from '@/services/api';
import { fetchSubLocations } from '@/services/apiProducts';
import {
  Category,
  SubCategory,
  Location,
  SubLocation,
  Filter,
} from '@/types/types';

interface UseFiltersProps {
  categories: Category[];
  subCategories: SubCategory[];
  locations: Location[];
  subLocations: SubLocation[];
  setSubCategories: (value: SubCategory[]) => void;
  setSubLocations: (value: SubLocation[]) => void;
}

const useFilters = ({
  categories,
  subCategories,
  locations,
  subLocations,
  setSubCategories,
  setSubLocations,
}: UseFiltersProps) => {
  const [filters, setFilters] = useState<Filter[]>([]);

  // Use refs to store current values and avoid stale closures
  const categoriesRef = useRef(categories);
  const locationsRef = useRef(locations);
  const subCategoriesRef = useRef(subCategories);
  const subLocationsRef = useRef(subLocations);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  useEffect(() => {
    subCategoriesRef.current = subCategories;
  }, [subCategories]);

  useEffect(() => {
    subLocationsRef.current = subLocations;
  }, [subLocations]);

  // Helper function to get filter name by type and id - MOVED TO TOP
  const getFilterName = useCallback(
    (type: string, id: number): string => {
      switch (type) {
        case 'categories':
          return (
            categoriesRef.current.find((item) => item.id === id)?.name ||
            `Category ${id}`
          );
        case 'subcategories':
          return (
            subCategoriesRef.current.find((item) => item.id === id)?.name ||
            `Subcategory ${id}`
          );
        case 'locations':
          return (
            locationsRef.current.find((item) => item.id === id)?.name ||
            `Location ${id}`
          );
        case 'sublocations':
          return (
            subLocationsRef.current.find((item) => item.id === id)?.name ||
            `Sublocation ${id}`
          );
        default:
          return `Filter ${id}`;
      }
    },
    [] // No dependencies since we use refs
  );

  const handleFilterChange = useCallback(
    async (
      type: 'locations' | 'sublocations' | 'categories' | 'subcategories',
      id: number
    ) => {
      setFilters((prevFilters: Filter[]) => {
        const isFilterSelected = prevFilters.some(
          (filter) => filter.id === id && filter.type === type
        );
        let updatedFilters: Filter[];

        if (!isFilterSelected) {
          // Add new filter
          const filterName = getFilterName(type, id);
          updatedFilters = [...prevFilters, { type, id, name: filterName }];
        } else {
          // Remove existing filter
          updatedFilters = prevFilters.filter(
            (filter) => !(filter.id === id && filter.type === type)
          );
        }

        // Handle category logic
        if (type === 'categories') {
          // Remove subcategories of the selected category
          updatedFilters = updatedFilters.filter(
            (filter) =>
              filter.type !== 'subcategories' ||
              !categoriesRef.current
                .find((cat) => cat.id === id)
                ?.subCategories?.some(
                  (sub: SubCategory) => sub.id === filter.id
                )
          );
        }

        // Handle location logic
        if (type === 'locations') {
          // Remove sublocations of the selected location
          updatedFilters = updatedFilters.filter(
            (filter) =>
              filter.type !== 'sublocations' ||
              !locationsRef.current
                .find((loc) => loc.id === id)
                ?.subLocations?.some((sub: SubLocation) => sub.id === filter.id)
          );
        }

        // Handle subcategory logic
        if (type === 'subcategories') {
          // Remove other subcategories and add the new one
          updatedFilters = updatedFilters.filter(
            (filter) => filter.type !== 'subcategories'
          );
          if (!isFilterSelected) {
            const filterName = getFilterName(type, id);
            updatedFilters.push({ type, id, name: filterName });
          }
        }

        // Handle sublocation logic
        if (type === 'sublocations') {
          // Remove other sublocations and add the new one
          updatedFilters = updatedFilters.filter(
            (filter) => filter.type !== 'sublocations'
          );
          if (!isFilterSelected) {
            const filterName = getFilterName(type, id);
            updatedFilters.push({ type, id, name: filterName });
          }
        }

        // Remove subcategories if no categories are selected
        if (!updatedFilters.some((filter) => filter.type === 'categories')) {
          updatedFilters = updatedFilters.filter(
            (filter) => filter.type !== 'subcategories'
          );
        }

        // Remove sublocations if no locations are selected
        if (!updatedFilters.some((filter) => filter.type === 'locations')) {
          updatedFilters = updatedFilters.filter(
            (filter) => filter.type !== 'sublocations'
          );
        }

        return updatedFilters;
      });

      // Fetch subcategories if category is selected
      if (type === 'categories') {
        const selectedCat = categoriesRef.current.find((cat) => cat.id === id);
        if (selectedCat) {
          try {
            const subCategoriesData = await fetchSubCategories(id);
            setSubCategories(subCategoriesData || []);
          } catch (error) {
            console.error('Error fetching subcategories:', error);
          }
        }
      }

      // Fetch sublocations if location is selected
      if (type === 'locations') {
        const selectedLoc = locationsRef.current.find((loc) => loc.id === id);
        if (selectedLoc) {
          try {
            const subLocationsData = await fetchSubLocations(id);
            setSubLocations(subLocationsData || []);
          } catch (error) {
            console.error('Error fetching sublocations:', error);
          }
        }
      }
    },
    [getFilterName, setSubCategories, setSubLocations]
  );

  const handleBack = useCallback(
    (type: 'locations' | 'categories') => {
      setFilters((prevFilters: Filter[]) => {
        if (type === 'categories') {
          return prevFilters.filter(
            (filter) =>
              filter.type !== 'categories' && filter.type !== 'subcategories'
          );
        } else if (type === 'locations') {
          return prevFilters.filter(
            (filter) =>
              filter.type !== 'locations' && filter.type !== 'sublocations'
          );
        }
        return prevFilters;
      });

      // Clear subcategories/sublocations when going back
      if (type === 'categories') {
        setSubCategories([]);
      } else if (type === 'locations') {
        setSubLocations([]);
      }
    },
    [setSubCategories, setSubLocations]
  );

  const handleClearAllFilters = useCallback(() => {
    setFilters([]);
    setSubCategories([]);
    setSubLocations([]);
  }, [setSubCategories, setSubLocations]);

  const removeFilter = useCallback(
    (filterId: number) => {
      setFilters((prevFilters: Filter[]) => {
        const filterToRemove = prevFilters.find((f) => f.id === filterId);

        if (filterToRemove?.type === 'categories') {
          // Remove category and its subcategories
          const updatedFilters = prevFilters.filter(
            (f) => f.id !== filterId && f.type !== 'subcategories'
          );
          setSubCategories([]);
          return updatedFilters;
        }

        if (filterToRemove?.type === 'locations') {
          // Remove location and its sublocations
          const updatedFilters = prevFilters.filter(
            (f) => f.id !== filterId && f.type !== 'sublocations'
          );
          setSubLocations([]);
          return updatedFilters;
        }

        // Remove single filter
        return prevFilters.filter((f) => f.id !== filterId);
      });
    },
    [setSubCategories, setSubLocations]
  );

  // Return filter data instead of JSX elements
  const filterList = useMemo(() => {
    return filters.map((filter) => ({
      id: filter.id,
      name: filter.name,
      type: filter.type,
      onClick: () => removeFilter(filter.id),
    }));
  }, [filters, removeFilter]);

  // Return filter data with enriched information
  const filterData = useMemo(() => {
    return filters.map((filter) => ({
      id: filter.id,
      name: filter.name,
      type: filter.type,
      canRemove: true,
    }));
  }, [filters]);

  return {
    filters,
    setFilters,
    handleFilterChange,
    handleBack,
    handleClearAllFilters,
    removeFilter,
    filterList,
    filterData,
  };
};

export default useFilters;
