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

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  subCategories,
  filters,
  isOpen,
  onToggle,
  onFilterChange,
  onBack,
}) => {
  return (
    <CollapsibleSection title="Category" open={isOpen} setOpen={onToggle}>
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
                      {
                        categories.find((cat) => cat.id === filterCategory.id)
                          ?.name
                      }
                    </span>
                  </li>
                ))}

              {filters.some((filter) => filter.type === 'subcategories') ? (
                <>
                  {filters
                    .filter((filter) => filter.type === 'subcategories')
                    .map((filterSubCategory) => (
                      <li key={filterSubCategory.id}>
                        <span className="flex text-sm ml-4 text-gray-800 ">
                          {
                            subCategories.find(
                              (subcat) => subcat.id === filterSubCategory.id
                            )?.name
                          }
                        </span>
                      </li>
                    ))}
                </>
              ) : (
                subCategories.map((subCategory) => (
                  <li
                    key={subCategory.id}
                    className="mb-1"
                    onClick={() =>
                      onFilterChange('subcategories', subCategory.id)
                    }
                  >
                    <span className="flex text-sm ml-4 text-gray-800 cursor-pointer">
                      {subCategory.name}
                    </span>
                  </li>
                ))
              )}
            </>
          ) : (
            categories.map((category) => (
              <li
                key={category.id}
                className="mb-1"
                onClick={() => onFilterChange('categories', category.id)}
              >
                <span className="flex text-sm text-gray-800 cursor-pointer">
                  {category.name}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </CollapsibleSection>
  );
};

export default CategoryFilter;
