'use client';

import React, { Suspense } from 'react';
import ProductsContent from '@/components/PageComponents/Shop/ProductsContent';
import LoadingSkeleton from '@/components/PageComponents/Shop/LoadingSkeleton';

const Products: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="h-full">
          <ProductsContent />
        </div>
      </Suspense>
    </div>
  );
};

export default Products;
