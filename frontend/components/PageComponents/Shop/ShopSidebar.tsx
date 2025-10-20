'use client';

import React from 'react';
import ProductListSidebar from '@/components/PageComponents/ProductListSidebar';
import CategoryFilter from './Filters/CategoryFilter';
import LocationFilter from './Filters/LocationFilter';
import PriceFilter from './Filters/PriceFilter';
import {
  Category,
  SubCategory,
  Location,
  SubLocation,
  Filter,
} from '@/types/types';

interface ShopSidebarProps {
  categories: Category[];
  locations: Location[];
  subCategories: SubCategory[];
  subLocations: SubLocation[];
  filters: Filter[];
  categoryOpen: boolean;
  locationOpen: boolean;
  priceOpen: boolean;
  minPrice: number;
  maxPrice: number;
  onCategoryToggle: React.Dispatch<React.SetStateAction<boolean>>;
  onLocationToggle: React.Dispatch<React.SetStateAction<boolean>>;
  onPriceToggle: React.Dispatch<React.SetStateAction<boolean>>;
  onMinPriceChange: (price: number) => void;
  onMaxPriceChange: (price: number) => void;
  onFilterChange: (type: string, id: number) => void;
  onBack: (type: 'locations' | 'categories') => void;
  onPriceFilter: (min: number, max: number) => void;
}

const ShopSidebar: React.FC<ShopSidebarProps> = ({
  categories,
  locations,
  subCategories,
  subLocations,
  filters,
  categoryOpen,
  locationOpen,
  priceOpen,
  minPrice,
  maxPrice,
  onCategoryToggle,
  onLocationToggle,
  onPriceToggle,
  onMinPriceChange,
  onMaxPriceChange,
  onFilterChange,
  onBack,
  onPriceFilter,
}) => {
  return (
    <aside className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-3 hidden lg:block px-2">
      <div className="overflow-hidden mb-6">
        <CategoryFilter
          categories={categories}
          subCategories={subCategories}
          filters={filters}
          isOpen={categoryOpen}
          onToggle={onCategoryToggle}
          onFilterChange={onFilterChange}
          onBack={onBack}
        />

        <div className="border-t border-gray-300 mb-6" />

        <LocationFilter
          locations={locations}
          subLocations={subLocations}
          filters={filters}
          isOpen={locationOpen}
          onToggle={onLocationToggle}
          onFilterChange={onFilterChange}
          onBack={onBack}
        />

        <div className="border-t border-gray-300 mb-6" />

        <PriceFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          isOpen={priceOpen}
          onToggle={onPriceToggle}
          onMinPriceChange={onMinPriceChange}
          onMaxPriceChange={onMaxPriceChange}
          onApply={onPriceFilter}
        />
      </div>

      <div className="product-sidebar-items mt-5 p-5">
        <ProductListSidebar filter="latest" count={4} />
      </div>
    </aside>
  );
};

export default ShopSidebar;
