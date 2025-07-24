'use client';

import React from 'react';
import CollapsibleSection from '@/components/PageComponents/Sidebar/ProfileSidebar/CollapsibleSection';

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  isOpen: boolean;
  onToggle: React.Dispatch<React.SetStateAction<boolean>>;
  onMinPriceChange: (price: number) => void;
  onMaxPriceChange: (price: number) => void;
  onApply: (min: number, max: number) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({
  minPrice,
  maxPrice,
  isOpen,
  onToggle,
  onMinPriceChange,
  onMaxPriceChange,
  onApply,
}) => {
  return (
    <CollapsibleSection title="Price" open={isOpen} setOpen={onToggle}>
      <div className="p-2">
        <div className="flex items-center justify-between mb-2 space-x-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">From</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              placeholder="Min price"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">To</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              placeholder="Max price"
            />
          </div>
        </div>

        {/* Price Range Display */}
        <div className="text-xs text-gray-500 mb-3 text-center">
          ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
        </div>

        <button
          onClick={() => onApply(minPrice, maxPrice)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm mt-3 px-3 py-2 rounded w-full transition-colors duration-200 font-medium"
          disabled={minPrice < 0 || maxPrice < 0 || minPrice > maxPrice}
        >
          Apply Filter
        </button>

        {/* Clear price filter button */}
        <button
          onClick={() => {
            onMinPriceChange(0);
            onMaxPriceChange(100000);
          }}
          className="text-xs text-gray-500 hover:text-gray-700 mt-2 w-full"
        >
          Reset Price Range
        </button>
      </div>
    </CollapsibleSection>
  );
};

export default PriceFilter;
