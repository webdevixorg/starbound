import React, { useState } from 'react';

interface DropdownProps {
  label: string;
  items: Array<{ text: string; href: string }>;
}

const Dropdown: React.FC<DropdownProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="menu-item menu-dropdown relative"
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        className="h-20 flex-shrink-0 flex items-center"
        aria-expanded={isOpen}
        onClick={toggleDropdown}
      >
        <a
          className={`inline-flex items-center text-sm lg:text-[15px] font-medium text-slate-700 dark:text-slate-300 py-2.5 px-4 xl:px-5 rounded-full ${
            isOpen
              ? 'text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-slate-200'
              : ''
          }`}
          href="#"
        >
          {label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="ml-1 -mr-1 h-4 w-4 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
              clipRule="evenodd"
            ></path>
          </svg>
        </a>
      </div>
      <div
        className={`absolute top-full inset-x-0 transform z-50 ${
          isOpen ? 'visible' : 'invisible'
        }`}
      >
        <div className="bg-white dark:bg-neutral-900 shadow-lg">
          <div className="container">
            <ul className="grid mt-4">
              {items.map((item, index) => (
                <li key={index} className="">
                  <a
                    className="font-normal text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white"
                    href={item.href}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
