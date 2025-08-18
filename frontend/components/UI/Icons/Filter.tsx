import React from 'react';

interface FilterIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
  stroke?: string; // Declare as optional
}

const FilterIcon: React.FC<FilterIconProps> = ({
  className,
  onClick,
  size = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke={'currentColor'}
      viewBox="0 0 24 24"
      fill={'none'}
      className={className}
      onClick={onClick}
      width={size}
      height={size}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
      />
    </svg>
  );
};

export default FilterIcon;
