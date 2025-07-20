import React from 'react';

interface InlineLoaderIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
}

const InlineLoaderIcon: React.FC<InlineLoaderIconProps> = ({
  className,
  onClick,
  size = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke="#fff"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      onClick={onClick}
      width={size}
      height={size}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );
};

export default InlineLoaderIcon;
