import React from 'react';
import { Filter } from '@/types/types';
import CloseIcon from '@mui/icons-material/Close';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';

interface ShopHeaderProps {
  query: string;
  start: number;
  end: number;
  totalPosts: number;
  filters: Filter[];
  filterList: Array<{
    id: number;
    name: string;
    type: string;
    onClick: () => void;
  }>;
  orderBy: string;
  viewType: 'list' | 'grid';
  onClearAllFilters: () => void;
  onOrderChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onViewChange: (type: 'list' | 'grid') => void;
  onSearch: (searchQuery: string, categorySlug?: string) => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({
  query,
  start,
  end,
  totalPosts,
  filters,
  filterList,
  orderBy,
  viewType,
  onClearAllFilters,
  onOrderChange,
  onViewChange,
}) => {
  return (
    <div className="shop-header flex flex-col sm:flex-row justify-between items-center mb-5">
      <div className="w-1/4">
        <div className="container mx-auto px-2">
          <header className="text-left">
            <BreadcrumbsComponent />
          </header>
        </div>
      </div>
      {/* Search Results Info */}
      <div className="w-3/4 flex flex-col gap-4 mb-2">
        {/* First Row: Search Results Info and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-gray-600">
              {query && (
                <span className="block text-sm mb-1">
                  Search results for: <strong>&quot;{query}&quot;</strong>
                </span>
              )}
              <span className="text-sm">
                Showing {start}-{end} of {totalPosts} results
              </span>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-4">
            <select
              value={orderBy}
              onChange={onOrderChange}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="id">Default sorting</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="-name">Name: Z to A</option>
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
            </select>

            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => onViewChange('list')}
                className={`px-3 py-2 text-sm ${
                  viewType === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
              <button
                onClick={() => onViewChange('grid')}
                className={`px-3 py-2 text-sm ${
                  viewType === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Active Filters */}
        {filters.length > 0 && (
          <div className="w-full">
            <div className="flex">
              <div className="flex flex-wrap gap-2">
                {filterList.map((filter) => (
                  <div
                    key={filter.id}
                    onClick={filter.onClick}
                    className="bg-blue-100 rounded-full text-xs px-3 py-1.5 cursor-pointer inline-flex items-center gap-1 hover:bg-blue-200 transition-colors"
                  >
                    <span>{filter.name}</span>
                    <span className="bg-white cursor-pointer w-4 h-4 text-xs rounded-full text-center inline-flex items-center justify-center">
                      <CloseIcon style={{ width: '10px', height: '10px' }} />
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={onClearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopHeader;
