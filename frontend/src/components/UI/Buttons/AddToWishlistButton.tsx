// components/AddToWishlistButton.tsx
import React from 'react';
import { useWishlist } from '../../../context/WishlistContext';
import { Product } from '../../../types/types';
import useToast from '../../../hooks/useToast';
import HeartIcon from '../Icons/Heart';

interface AddToWishlistButtonProps {
  product: Product;
}

const AddToWishlistButton: React.FC<AddToWishlistButtonProps> = ({
  product,
}) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const { showToast } = useToast(); // Use the hook
  // Check if the product is already in the wishlist
  const isInWishlist = wishlist.some((item) => item.product.id === product.id);

  const handleAddToWishlist = () => {
    if (isInWishlist) {
      // Find the wishlist item by product ID and use its wishlist ID for removal
      const wishlistItem = wishlist.find(
        (item) => item.product.id === product.id
      );
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id.toString()); // Use the wishlist item's ID
      }
    } else {
      addToWishlist(product.id); // Add to wishlist using the product ID
    }
    showToast(`"${product.title}" added to wishlist!`, 'success'); // Show success toast
  };

  return (
    <button
      onClick={handleAddToWishlist}
      title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      className={`add-to-wishlist-icon ${
        isInWishlist ? 'inwishlist' : 'default'
      }
    w-10 h-10
    flex items-center justify-center 
    bg-white 
    text-white 
    rounded-full 
    transition duration-300
  `}
    >
      <HeartIcon className={` transition duration-300`} />
    </button>
  );
};

export default AddToWishlistButton;
