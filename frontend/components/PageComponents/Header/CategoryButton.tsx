'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { fetchCategories } from '@/services/api';
import MenuIcon2 from '@/components/UI/Icons/Menu2';
import ArrowDownIcon from '@/components/UI/Icons/ArrowDown';
import ArrowRightIcon from '@/components/UI/Icons/ArrowRight';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  content_type_id?: number;
  parent?: number | null;
  children?: Category[];
}

export default function CategoryButton() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Helper function to build category URLs
  const buildCategoryUrl = (categorySlug: string, subcategorySlug?: string) => {
    const params = new URLSearchParams();
    params.set('category', categorySlug.trim());
    if (subcategorySlug) {
      params.set('subcategory', subcategorySlug.trim());
    }
    return `/shop?${params.toString()}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories(1, 10); // Provide default page and pageSize
        const topCategories = Array.isArray(data) ? data : [data];
        setCategories(topCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchData();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [menuOpen]);

  return (
    <div className="mr-4 w-[250px]" ref={menuRef}>
      <button
        className="w-full text-left font-semibold text-sm flex items-center justify-between bg-white text-black py-3 pr-4 rounded-t-md"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <MenuIcon2 />
        <span className="ml-2">Shop By Categories</span>
        <ArrowDownIcon />
      </button>

      {menuOpen && (
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-md shadow-lg max-h-[80vh] overflow-visible">
          {categories.slice(0, 10).map((category) => (
            <li
              key={category.id}
              className="relative group border-b border-gray-100"
            >
              <Link
                href={buildCategoryUrl(category.slug)}
                className="w-full text-left py-2 px-4 hover:bg-gray-100 text-gray-800 font-medium flex justify-between items-center block"
                onClick={() => setMenuOpen(false)}
              >
                <span>{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <ArrowRightIcon isOpen={false} />
                )}
              </Link>

              {category.children && category.children.length > 0 && (
                <ul className="absolute left-full top-0 min-w-[220px] bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible translate-x-2 transition-all duration-300">
                  {category.children.map((sub) => (
                    <li
                      key={sub.id}
                      className="py-2 px-4 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Link
                        href={buildCategoryUrl(category.slug, sub.slug)}
                        className="block w-full hover:text-blue-600 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* More Categories Link */}
          {categories.length > 10 && (
            <li className="border-t border-gray-200">
              <Link
                href="/shop"
                className="block w-full py-2 px-4 text-blue-600 hover:underline text-sm text-center"
                onClick={() => setMenuOpen(false)}
              >
                More Categories →
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
