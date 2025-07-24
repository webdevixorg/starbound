import React from 'react';
import './SearchInput.css';

const SearchInput: React.FC = () => {
  return (
    <input
      type="text"
      className="block w-full py-1.5 pl-10 pr-4 leading-normal rounded-2xl focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ring-opacity-90 bg-gray-100 dark:bg-gray-800 text-gray-400 aa-input"
      placeholder="Search"
    />
  );
};

export default SearchInput;
