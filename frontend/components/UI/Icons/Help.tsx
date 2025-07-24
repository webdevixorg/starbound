import React from 'react';

interface HelpIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
}

const HelpIcon: React.FC<HelpIconProps> = ({
  className,
  onClick,
  size = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke="#fff"
      viewBox="0 0 24 24"
      fill="#fff"
      className={className}
      onClick={onClick}
      width={size}
      height={size}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#5a5858"
          strokeWidth="1.5"
        ></circle>
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="#5a5858"
          strokeWidth="1.5"
        ></circle>
        <path d="M15 9L19 5" stroke="#5a5858" strokeWidth="1.5"></path>
        <path d="M5 19L9 15" stroke="#5a5858" strokeWidth="1.5"></path>
        <path d="M9 9L5 5" stroke="#5a5858" strokeWidth="1.5"></path>
        <path d="M19 19L15 15" stroke="#5a5858" strokeWidth="1.5"></path>
      </g>
    </svg>
  );
};

export default HelpIcon;
