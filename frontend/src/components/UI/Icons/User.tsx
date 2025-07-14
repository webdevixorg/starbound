import React from 'react';

interface UserIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
}

const UserIcon: React.FC<UserIconProps> = ({
  className,
  onClick,
  size = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke="none"
      viewBox="0 0 24 24"
      fill="none"
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
        <path
          d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );
};

export default UserIcon;
