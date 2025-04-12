// components/AddToCartButton.tsx
import React from 'react';
import { useCart } from '../../../context/CartContext';
import { Product } from '../../../types/types';
import useToast from '../../../hooks/useToast';

interface AddToCartButtonProps {
  product: Product;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const { dispatch } = useCart();
  const { showToast } = useToast(); // Use the hook

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        name: product.title,
        price: product.price,
        quantity: 1,
        image: product.images[0]?.image_path || '',
      },
    });
    showToast(`"${product.title}" added to cart!`, 'success'); // Show success toast
  };

  return (
    <button
      onClick={handleAddToCart}
      className="
      inline-block 
      flex-1 
      text-center 
      text-white
      text-sm 
      font-bold 
      py-2 
      px-4 
      bg-red-600 
      hover:bg-red-700
    "
    >
      Add To Cart
    </button>
  );
};

export default AddToCartButton;
