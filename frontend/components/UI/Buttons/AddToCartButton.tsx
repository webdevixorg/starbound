// components/AddToCartButton.tsx
import React from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/types';
import useToast from '@/hooks/useToast';
import CartIcon from '@/components/UI/Icons/Cart';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'icon' | 'full';
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  variant = 'icon',
}) => {
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

  if (variant === 'full') {
    return (
      <button
        onClick={handleAddToCart}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 group"
      >
        <span>Add to cart</span>
        <div className="text-current transition-transform duration-300 group-hover:translate-x-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M3.33697 5.34738L0.634766 2.64518L1.81327 1.46667L4.51547 4.16887H17.2169C17.6772 4.16887 18.0502 4.54197 18.0502 5.00221C18.0502 5.08331 18.0384 5.16398 18.0152 5.24167L16.0152 11.9083C15.9094 12.2608 15.5849 12.5022 15.2169 12.5022H5.00363V14.1689H14.1703V15.8356H4.1703C3.71006 15.8356 3.33697 15.4624 3.33697 15.0023V5.34738ZM5.00363 5.83554V10.8356H14.5969L16.0969 5.83554H5.00363ZM4.58697 19.1689C3.89661 19.1689 3.33697 18.6093 3.33697 17.9189C3.33697 17.2285 3.89661 16.6689 4.58697 16.6689C5.27733 16.6689 5.83697 17.2285 5.83697 17.9189C5.83697 18.6093 5.27733 19.1689 4.58697 19.1689ZM14.587 19.1689C13.8966 19.1689 13.337 18.6093 13.337 17.9189C13.337 17.2285 13.8966 16.6689 14.587 16.6689C15.2773 16.6689 15.837 17.2285 15.837 17.9189C15.837 18.6093 15.2773 19.1689 14.587 19.1689Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className="add-to-cart-icon
    w-10 h-10
    flex items-center justify-center 
    bg-gray-100 
    text-gray-900 
    rounded-full 
    transition duration-300
    hover:bg-gray-900 hover:text-white
  "
    >
      <CartIcon />
    </button>
  );
};

export default AddToCartButton;
