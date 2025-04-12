import React from 'react';

interface ArrowUpRightIconProps {
  rotation?: number; // Add this line
}

const ArrowUpRightIcon: React.FC<ArrowUpRightIconProps> = ({ rotation }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`ml-1 -mr-1 h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out rotate-${rotation}`}
    >
      <path
        fillRule="evenodd"
        d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 1 1-1.06-1.06l7.5-7.5Z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

export default ArrowUpRightIcon;
