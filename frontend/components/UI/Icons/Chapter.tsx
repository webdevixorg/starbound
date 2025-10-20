import React from 'react';

interface ChapterIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
  stroke?: string; // Declare as optional
}

const ChapterIcon: React.FC<ChapterIconProps> = ({
  className,
  onClick,
  size = 24,
  stroke = '#ffffffff', // Set default here
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke}
      viewBox="0 0 20 20"
      fill={stroke}
      className={className}
      onClick={onClick}
      width={size}
      height={size}
    >
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default ChapterIcon;
