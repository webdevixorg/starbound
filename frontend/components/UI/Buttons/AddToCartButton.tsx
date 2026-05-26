// components/AddToCartButton.tsx
import React from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/types';
import useToast from '@/hooks/useToast';
import CartIcon from '@/components/UI/Icons/Cart';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'icon' | 'full'; // Kept for compatibility, but ignored for visual consistency
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const { dispatch } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    showToast(`"${product.title}" added to cart!`, 'success');
  };

  return (
    <button
      onClick={handleAddToCart}
      className="add-to-cart-icon w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-900 rounded-full transition duration-300 hover:bg-gray-900 hover:text-white"
    >
      <CartIcon />
    </button>
  );
};

export default AddToCartButton;
