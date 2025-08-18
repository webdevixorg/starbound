'use client';

import React from 'react';
import CollapsibleSection from '@/components/PageComponents/Sidebar/ProfileSidebar/CollapsibleSection';
import { Category, SubCategory, Filter } from '@/types/types';

interface CategoryFilterProps {
  categories: Category[];
  subCategories: SubCategory[];
  filters: Filter[];
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onFilterChange: (type: string, id: number) => void;
  onBack: (type: 'categories') => void;
}

function CategoryFilter({
  categories,
  subCategories,
  filters,
  isOpen,
  onToggle,
  onFilterChange,
  onBack,
}: CategoryFilterProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(!isOpen);
  
  React.useEffect(() => {
    setIsCollapsed(!isOpen);
  }, [isOpen]);

  const handleToggle = (open: boolean) => {
    setIsCollapsed(!open);
    onToggle(open);
  };

  return (
    <CollapsibleSection title="Category" open={!isCollapsed} setOpen={setIsCollapsed}>
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 rounded-md">
        <ul>
          {filters.some((filter) => filter.type === 'categories') ? (
            <>
              <li>
                <button
                  onClick={() => onBack('categories')}
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  Back to All Categories
                </button>
              </li>

              {filters
                .filter((filter) => filter.type === 'categories')
                .map((filterCategory) => (
                  <li key={filterCategory.id}>
                    <span
                      className="flex text-sm font-bold text-gray-800 cursor-pointer"
                      onClick={() =>
                        onFilterChange('categories', filterCategory.id)
                      }
                    >
                      <span className="p-4 w-full border-b border-gray-200 hover:bg-gray-50">
                        {filterCategory.name}
                      </span>
                    </span>

                    <ul className="ml-2">
                      {subCategories
                        .filter(
                          (subCategory) =>
                            subCategory.parent_id === filterCategory.id
                        )
                        .map((subCategory) => (
                          <li key={subCategory.id}>
                            <span
                              className="flex text-sm text-gray-600 cursor-pointer"
                              onClick={() =>
                                onFilterChange('subcategories', subCategory.id)
                              }
                            >
                              <span className="p-4 w-full border-b border-gray-200 hover:bg-gray-50">
                                {subCategory.name}
                              </span>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
            </>
          ) : (
            <>
              {categories.map((category) => (
                <li key={category.id}>
                  <span
                    className="flex text-sm font-bold text-gray-800 cursor-pointer"
                    onClick={() => onFilterChange('categories', category.id)}
                  >
                    <span className="p-4 w-full border-b border-gray-200 hover:bg-gray-50">
                      {category.name}
                    </span>
                  </span>

                  <ul className="ml-2">
                    {subCategories
                      .filter(
                        (subCategory) => subCategory.parent_id === category.id
                      )
                      .map((subCategory) => (
                        <li key={subCategory.id}>
                          <span
                            className="flex text-sm text-gray-600 cursor-pointer"
                            onClick={() =>
                              onFilterChange('subcategories', subCategory.id)
                            }
                          >
                            <span className="p-4 w-full border-b border-gray-200 hover:bg-gray-50">
                              {subCategory.name}
                            </span>
                          </span>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
    </CollapsibleSection>
  );
}

export default CategoryFilter;
