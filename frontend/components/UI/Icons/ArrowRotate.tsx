interface ArrowRotateIconProps {
  isExpanded: boolean;
  className?: string;
  onClick?: () => void;
  size?: number;
  stroke?: string; // Declare as optional
}

const ArrowRotateIcon: React.FC<ArrowRotateIconProps> = ({
  isExpanded,
  className,
  onClick,
  size = 24,
  stroke = '#000', // Set default here
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${
        className
      } w-3 h-3 text-gray-400 transition-transform duration-200 ${
        isExpanded ? 'rotate-180' : 'rotate-90'
      }`}
      onClick={onClick}
      width={size}
      height={size}
    >
      <path
        fillRule="evenodd"
        d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 1 1-1.06-1.06l7.5-7.5Z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

export default ArrowRotateIcon;
