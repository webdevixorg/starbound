// TaskIcon.tsx
import React from 'react';

const TaskIcon: React.FC<{ className?: string; path: string }> = ({
  className,
  path,
}) => (
  <svg
    width="20"
    height="20"
    fill="currentColor"
    className={className}
    viewBox="0 0 1024 1024"
  >
    <path d={path}></path>
  </svg>
);

export default TaskIcon;
