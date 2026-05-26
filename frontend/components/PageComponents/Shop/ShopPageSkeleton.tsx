import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ShopPageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto my-5 px-4 sm:px-6 lg:px-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="shop-header flex flex-col sm:flex-row justify-between items-center mb-5">
        <div className="w-1/4">
          <Skeleton height={24} width="70%" />
        </div>
        <div className="w-3/4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <Skeleton height={20} width={200} />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton height={38} width={150} />
              <Skeleton height={38} width={100} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Skeleton */}
        <div className="col-span-12 md:col-span-3">
          <div className="space-y-6">
            {/* Category Filter Skeleton */}
            <div>
              <Skeleton height={24} width={150} />
              <div className="mt-4 space-y-2">
                <Skeleton height={20} count={9} />
              </div>
            </div>
            <div className="border-t border-gray-200" />

            {/* Location Filter Skeleton */}
            <div>
              <Skeleton height={24} width={120} />
              <div className="mt-4 space-y-2">
                <Skeleton height={20} count={8} />
              </div>
            </div>
            <div className="border-t border-gray-200" />

            {/* Price Filter Skeleton */}
            <div>
              <Skeleton height={24} width={100} />
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center space-x-4">
                  <Skeleton height={38} className="w-full" />
                  <Skeleton height={38} className="w-full" />
                </div>
                <Skeleton height={38} className="w-full" />
              </div>
            </div>
          </div>
          {/* ProductListSidebar Skeleton */}
          <div className="mt-8">
            <Skeleton height={30} width={200} />
            <div className="mt-4 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton
                    height={64}
                    width={64}
                    style={{ borderRadius: '0.75rem' }}
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton height={16} />
                    <Skeleton height={12} width="50%" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products List Skeleton */}
        <div className="col-span-12 md:col-span-9">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse"
              >
                {/* Image Skeleton */}
                <div className="w-full md:w-1/3">
                  <div className="aspect-square bg-gray-200">
                    <Skeleton height="100%" />
                  </div>
                </div>
                {/* Content Skeleton */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Skeleton
                        width={70}
                        height={20}
                        style={{ borderRadius: '9999px' }}
                      />
                      <Skeleton
                        width={90}
                        height={20}
                        style={{ borderRadius: '9999px' }}
                      />
                    </div>
                    <Skeleton height={28} width="80%" className="mb-1" />
                    <Skeleton height={20} width="40%" className="mt-1 mb-2" />
                    <Skeleton height={16} count={2} className="mt-2" />
                    <div className="mt-4">
                      <Skeleton height={28} width="50%" />
                    </div>
                    <div className="mt-2">
                      <Skeleton height={16} width="30%" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <Skeleton height={20} width="100px" />
                    <Skeleton
                      height={40}
                      width="120px"
                      style={{ borderRadius: '9999px' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPageSkeleton;
