import React from 'react';
import LoadingSpinner from '@/components/Common/Loading';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
};

export default LoadingSkeleton;
