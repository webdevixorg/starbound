import { useState } from 'react';
import SearchIcon from '../../UI/Icons/Search';

const SearchBar = () => {
  const [query, setQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('Searching for:', query); // Replace this with actual search logic
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-[817px] h-[44px] ">
      <div className="w-full h-full flex items-center border border-gray-300 bg-white rounded">
        {/* All Categories - 1/4 Width */}
        <div className="flex items-center px-4 w-1/4">
          <button
            type="button"
            className="w-full text-xs font-medium text-gray-600 flex justify-between items-center"
          >
            <span>All Categories</span>
            <span>
              <svg
                width="10"
                height="5"
                viewBox="0 0 10 5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
            </span>
          </button>
        </div>

        <div className="w-[1px] h-[22px] bg-gray-300"></div>

        {/* Search Input - 2/4 Width */}
        <div className="px-4 w-3/4">
          <input
            type="text"
            className="search-input border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none w-full"
            placeholder="Search Product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Search Button - 1/4 Width */}
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
