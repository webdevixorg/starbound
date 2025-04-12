// components/AddToCartIcon.tsx
import React from 'react';
import { useCart } from '../../../context/CartContext';
import { Product } from '../../../types/types';
import useToast from '../../../hooks/useToast';
import CartIcon from '../Icons/Cart';

interface AddToCartIconProps {
  product: Product;
}

const AddToCartIcon: React.FC<AddToCartIconProps> = ({ product }) => {
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
      className="add-to-cart-icon
    w-10 h-10
    flex items-center justify-center 
    bg-white 
    text-white 
    rounded-full 
    transition duration-300
  "
    >
      <CartIcon />
    </button>
  );
};

export default AddToCartIcon;
