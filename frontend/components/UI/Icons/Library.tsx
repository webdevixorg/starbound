import React from 'react';

interface LibraryIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
  stroke?: string; // Declare as optional
}

const LibraryIcon: React.FC<LibraryIconProps> = ({
  className,
  onClick,
  size = 24,
  stroke = '#ffffffff', // Set default here
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke}
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
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />{' '}
    </svg>
  );
};

export default LibraryIcon;
