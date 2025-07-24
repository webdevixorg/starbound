import React from 'react';

interface DarkModeToggleIconProps {
  isDarkMode: boolean;
}

const DarkModeToggleIcon: React.FC<DarkModeToggleIconProps> = ({
  isDarkMode,
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isDarkMode ? (
        <path
          d="M12 3C13.6569 3 15 4.34315 15 6C15 7.65685 13.6569 9 12 9C10.3431 9 9 7.65685 9 6C9 4.34315 10.3431 3 12 3ZM12 15C14.7614 15 17 12.7614 17 10C17 7.23858 14.7614 5 12 5C9.23858 5 7 7.23858 7 10C7 12.7614 9.23858 15 12 15ZM12 20C13.6569 20 15 21.3431 15 23C15 24.6569 13.6569 26 12 26C10.3431 26 9 24.6569 9 23C9 21.3431 10.3431 20 12 20ZM4 12C5.65685 12 7 13.3431 7 15C7 16.6569 5.65685 18 4 18C2.34315 18 1 16.6569 1 15C1 13.3431 2.34315 12 4 12ZM20 12C21.6569 12 23 13.3431 23 15C23 16.6569 21.6569 18 20 18C18.3431 18 17 16.6569 17 15C17 13.3431 18.3431 12 20 12Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          fill="currentColor"
        />
      )}
    </svg>
  );
};

export default DarkModeToggleIcon;
