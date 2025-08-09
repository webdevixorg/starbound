'use client';

import React from 'react';
import ProductCardGrid from '@/components/PageComponents/ProdutctCardGrid';
import ProductCardList from '@/components/PageComponents/ProdutctCardList';
import PaginationControls from '@/components/Navigation/Pagination';
import { Product } from '@/types/types';

interface ProductsGridProps {
  products: Product[];
  viewType: 'list' | 'grid';
  page: number;
  totalPosts: number;
  pageSize: number;
  loading: boolean;

  onPageChange: (page: number) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  viewType,
  page,
  totalPosts,
  pageSize,
  onPageChange,
}) => {
  return (
    <main className="col-span-12 ms-col-span-12 md:col-span-12 lg:col-span-9">
      {/* Product Display */}
      <div>
        {viewType === 'list' ? (
          <ul className="space-y-4">
            {products.map((product: Product) => (
              <ProductCardList key={product.id} product={product} />
            ))}
          </ul>
        ) : (
          <div className="col-span-12 md:col-span-8 lg:col-span-8 xl:col-span-9">
            <div className="container grid grid-cols-12 gap-5">
              {products.map((product) => (
                <ProductCardGrid
                  key={product.id}
                  product={product}
                  imageHeight={''}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-5 text-center">
        <PaginationControls
          page={page}
          totalPosts={totalPosts > 0 ? totalPosts : 1}
          pageSize={pageSize > 0 ? pageSize : 1}
          setPage={onPageChange}
          previous={String(page > 1)}
          next={String(page < Math.ceil(totalPosts / pageSize))}
        />
      </div>
    </main>
  );
};

export default ProductsGrid;
