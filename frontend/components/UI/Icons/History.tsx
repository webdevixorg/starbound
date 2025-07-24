import React from 'react';

interface HistoryIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
}

const HistoryIcon: React.FC<HistoryIconProps> = ({
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
          d="M1.96336 6.30713C1.74958 6.66192 1.86389 7.12283 2.21868 7.33661C2.57346 7.55038 3.03437 7.43607 3.24815 7.08129L1.96336 6.30713ZM2.5879 15.8197C2.43 15.4367 1.99156 15.2543 1.60863 15.4122C1.22569 15.5701 1.04326 16.0086 1.20116 16.3915L2.5879 15.8197ZM11.6058 2.35559C16.9905 2.35559 21.3558 6.72082 21.3558 12.1056L22.8558 12.1056C22.8558 5.89239 17.819 0.855592 11.6058 0.855592L11.6058 2.35559ZM21.3558 12.1056C21.3558 17.4904 16.9905 21.8556 11.6058 21.8556L11.6058 23.3556C17.819 23.3556 22.8558 18.3188 22.8558 12.1056L21.3558 12.1056ZM3.24815 7.08129C4.95544 4.24789 8.05998 2.35559 11.6058 2.35559L11.6058 0.855592C7.51256 0.855591 3.93077 3.04204 1.96336 6.30713L3.24815 7.08129ZM11.6058 21.8556C7.53732 21.8556 4.04917 19.3635 2.5879 15.8197L1.20116 16.3915C2.88598 20.4774 6.90887 23.3556 11.6058 23.3556L11.6058 21.8556Z"
          fill="#5a5858"
        ></path>
        <path
          d="M2.10477 4.10559L2.10477 7.10559L5.00342 6.62248"
          stroke="#5a5858"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M15 11.5L11 13.5V7"
          stroke="#5a5858"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );
};

export default HistoryIcon;
