import React, { useEffect, useState } from 'react';
import { fetchProductsForSections } from '../../services/api'; // Ensure this path is correct
import { Product } from '../../types/types';
import ProductCardGrid from './ProdutctCardGrid';

const ProductGridSection: React.FC<{ filter: string; count: number }> = ({
  filter,
  count,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProductsForSections(filter, count);
        setProducts(data.results);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    loadProducts();
  }, [filter, count]);

  return (
    <section className="py-12 bg-white-50">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="text-3xl text-left text-gray-800 mb-8">
          <span className="font-bold">Popular</span> Products
        </h2>
        <div className="col-span-12 md:col-span-8 lg:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-12 gap-5">
            {products.map((product) => (
              <ProductCardGrid
                key={product.id}
                product={product}
                imageHeight={''}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGridSection;
