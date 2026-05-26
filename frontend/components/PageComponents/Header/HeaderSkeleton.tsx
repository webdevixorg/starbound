import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HeaderSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="hidden md:block border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex gap-4">
              <Skeleton width={120} height={16} />
              <Skeleton width={150} height={16} />
            </div>
            <div className="flex gap-4">
              <Skeleton width={80} height={16} />
              <Skeleton width={80} height={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Skeleton */}
      <div className="relative bg-white/95 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo Skeleton */}
            <Skeleton width={150} height={48} />

            {/* Search Bar Skeleton - Desktop */}
            <div className="flex-1 hidden lg:flex justify-center mx-8 max-w-2xl">
              <div className="w-full relative h-11 lg:h-12">
                <div className="w-full h-full flex items-center bg-gray-100 border border-gray-200 rounded-lg">
                  {/* Categories Dropdown Skeleton */}
                  <div className="relative flex items-center px-3 lg:px-4 min-w-0 flex-shrink-0">
                    <Skeleton width={110} height={24} />
                  </div>
                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Search Input Skeleton */}
                  <div className="flex-1 px-3 lg:px-4 relative">
                    <Skeleton height={24} />
                  </div>

                  {/* Search Button Skeleton */}
                  <div className="flex items-center justify-center px-4 lg:px-6 h-full bg-gray-300 rounded-r-lg">
                    <Skeleton circle height={20} width={20} />
                    <span className="ml-2 hidden lg:inline">
                      <Skeleton width={50} height={20} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section Skeleton */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Skeleton circle width={40} height={40} />
              <Skeleton circle width={40} height={40} />
              <div className="hidden md:flex items-center space-x-2">
                <Skeleton
                  width={80}
                  height={36}
                  style={{ borderRadius: '0.5rem' }}
                />
                <Skeleton
                  width={80}
                  height={36}
                  style={{ borderRadius: '0.5rem' }}
                />
              </div>
              <div className="md:hidden">
                <Skeleton
                  width={40}
                  height={40}
                  style={{ borderRadius: '0.5rem' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu Skeleton - Desktop */}
      <div className="hidden lg:block bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Skeleton width={180} height={48} />
              <div className="flex gap-4 ml-4">
                <Skeleton width={80} height={24} />
                <Skeleton width={100} height={24} />
                <Skeleton width={70} height={24} />
                <Skeleton width={90} height={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSkeleton;
