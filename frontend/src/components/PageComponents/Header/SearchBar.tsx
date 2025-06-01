import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '../../UI/Icons/Search';
import { fetchCategories } from '../../../services/api';
import { Category } from '../../../types/types';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setQuery((searchParams.get('query') || '').trim());
    setSelectedCategory((searchParams.get('category') || '').trim());
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories(1, 10);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    const trimmedCategory = selectedCategory.trim();

    if (!trimmedQuery) {
      console.warn('Search query is empty or invalid.');
      return;
    }

    const params = new URLSearchParams({ query: trimmedQuery });
    if (trimmedCategory) {
      params.set('category', trimmedCategory);
    }

    navigate(`/products?${params.toString()}`);
  };

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return 'All Categories';
    return (
      categories.find((c) => c.slug.trim() === selectedCategory)?.name ||
      'Unknown Category'
    );
  }, [selectedCategory, categories]);

  return (
    <form onSubmit={handleSearch} className="w-full h-[44px] relative">
      <div className="w-full h-full flex items-center border border-gray-300 bg-white rounded">
        {/* Categories Dropdown */}
        <div className="flex items-center px-4 w-1/4 relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="w-full text-xs font-medium text-gray-600 flex justify-between items-center"
          >
            <span>{selectedCategoryName}</span>
            <svg width="10" height="5" viewBox="0 0 10 5" fill="none">
              <rect
                x="9.18359"
                y="0.90918"
                width="5.78538"
                height="1.28564"
                transform="rotate(135 9.18359 0.90918)"
                fill="#8E8E8E"
              />
              <rect
                x="5.08984"
                y="5"
                width="5.78538"
                height="1.28564"
                transform="rotate(-135 5.08984 5)"
                fill="#8E8E8E"
              />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute top-[30px] left-0 z-[9999] w-full bg-white border border-gray-300 rounded shadow">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.slug.trim());
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-[22px] bg-gray-300"></div>

        {/* Search Input */}
        <div className="px-4 w-3/4">
          <input
            type="text"
            className="search-input border-none outline-none ring-0 focus:ring-0 w-full"
            placeholder="Search Product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          className="h-full bg-red-500 text-sm text-center text-white font-semibold px-4 rounded-tr rounded-br"
          type="submit"
        >
          <SearchIcon />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
