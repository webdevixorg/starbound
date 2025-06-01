import { useEffect, useState } from 'react';
import { fetchCategories } from '../../../services/api';
import MenuIcon2 from '../../UI/Icons/Menu2';
import ArrowDownIcon from '../../UI/Icons/ArrowDown';
import ArrowRightIcon from '../../UI/Icons/ArrowRight';

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

  return (
    <div className="relative w-[279px] z-50">
      <button
        className="w-full text-left font-semibold text-sm flex items-center justify-between bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-t-md"
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
              <button className="w-full text-left py-2 px-4 hover:bg-gray-100 text-gray-800 font-medium flex justify-between items-center">
                <span>{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <ArrowRightIcon isOpen={false} />
                )}
              </button>

              {category.children && category.children.length > 0 && (
                <ul className="absolute left-full top-0 min-w-[220px] bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible translate-x-2 transition-all duration-300">
                  {category.children.map((sub) => (
                    <li
                      key={sub.id}
                      className="py-2 px-4 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {sub.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* More Categories Link */}
          {categories.length > 10 && (
            <li className="border-t border-gray-200">
              <a
                href="/products"
                className="block w-full py-2 px-4 text-blue-600 hover:underline text-sm text-center"
              >
                More Categories →
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
