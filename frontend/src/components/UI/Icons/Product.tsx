import React from 'react';

interface ProductIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
}

const ProductIcon: React.FC<ProductIconProps> = ({
  className,
  onClick,
  size = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke="none"
      viewBox="0 0 24 24"
      fill="#5a5858"
      className={className}
      onClick={onClick}
      width={size}
      height={size}
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <rect x="0" fill="none" width="24" height="24"></rect>
        <g>
          <path d="M22 3H2v6h1v11c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V9h1V3zM4 5h16v2H4V5zm15 15H5V9h14v11zM9 11h6c0 1.105-.895 2-2 2h-2c-1.105 0-2-.895-2-2z"></path>
        </g>
      </g>
    </svg>
  );
};

export default ProductIcon;
