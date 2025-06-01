import React from 'react';

import { useWishlist } from '../../context/WishlistContext';

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistSidebar: React.FC<WishlistSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Your Wishlist</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
          &times;
        </button>
      </div>
      <div className="p-4">
        {wishlist.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Your wishlist is empty.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center">
                  <img
                    src={
                      Array.isArray(item.product.images) &&
                      item.product.images.length > 0
                        ? item.product.images[0].image_path
                        : '/placeholder.png'
                    }
                    alt={item.product.title}
                    className="h-12 w-12 rounded"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium">{item.product.title}</p>
                    <p className="text-sm text-gray-500"></p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeFromWishlist(String(item.id))}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistSidebar;
