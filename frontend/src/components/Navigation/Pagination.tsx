// src/components/PaginationControls.tsx

import React from 'react';

interface PaginationControlsProps {
  page: number;
  totalPosts: number;
  pageSize: number;
  next: string | null;
  previous: string | null;
  setPage: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPosts,
  pageSize,
  next,
  previous,
  setPage,
}) => {
  const totalPages = Math.ceil(totalPosts / pageSize);

  return (
    <nav className="flex items-center justify-center gap-x-1 mt-8">
      <button
        type="button"
        onClick={() => setPage(Math.max(page - 1, 1))}
        disabled={!previous}
        className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:border-transparent dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
      >
        <svg
          className="flex-shrink-0 size-3.5"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        <span aria-hidden="true" className="sr-only">
          Previous
        </span>
      </button>
      <div className="flex items-center justify-center gap-x-1">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            type="button"
            onClick={() => setPage(index + 1)}
            className={`min-h-[38px] min-w-[38px] flex justify-center items-center border ${
              page === index + 1 ? 'border-gray-200' : 'border-transparent'
            } text-gray-800 py-2 px-3 text-sm rounded-lg focus:outline-none ${
              page === index + 1 ? 'bg-gray-50' : 'hover:bg-gray-100'
            } disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-white dark:focus:bg-white/10`}
            aria-current={page === index + 1 ? 'page' : undefined}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPage(next ? page + 1 : page)}
        disabled={!next}
        className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:border-transparent dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
      >
        <span aria-hidden="true" className="sr-only">
          Next
        </span>
        <svg
          className="flex-shrink-0 size-3.5"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6"></path>
        </svg>
      </button>
    </nav>
  );
};

export default PaginationControls;
