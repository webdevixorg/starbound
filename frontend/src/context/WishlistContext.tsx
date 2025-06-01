import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchWishlist,
  addToWishlist,
  deleteFromWishlist,
} from '../services/api';
import { fetchProductById } from '../services/apiProducts';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: number;
  product: {
    images: any;
    id: number;
    title: string;
    price: number;
    image?: string;
  };
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (id: string) => void;
  isAuthenticated: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider: React.FC<{
  children: React.ReactNode;
  isAuthenticated: boolean;
}> = ({ children, isAuthenticated }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { user } = useAuth(); // Assuming `useAuth` provides the authenticated user details

  // Fetch wishlist from the backend and localStorage, and combine them
  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        let localWishlist: WishlistItem[] = [];
        const localData = localStorage.getItem('wishlist');
        if (localData) {
          localWishlist = JSON.parse(localData);
        }

        if (isAuthenticated && user) {
          const dbWishlist = await fetchWishlist(); // Fetch wishlist from the backend

          // Combine local and database wishlist, avoiding duplicates
          const combinedWishlist = [...dbWishlist];
          localWishlist.forEach((localItem) => {
            if (
              !dbWishlist.some(
                (dbItem: { product: { id: number } }) =>
                  dbItem.product.id === localItem.product.id
              )
            ) {
              combinedWishlist.push(localItem);
            }
          });

          // Update the database with any new items from localStorage
          for (const localItem of localWishlist) {
            if (
              !dbWishlist.some(
                (dbItem: { product: { id: number } }) =>
                  dbItem.product.id === localItem.product.id
              )
            ) {
              await addToWishlist(localItem.product.id); // Add missing items to the backend
            }
          }

          setWishlist(combinedWishlist);
        } else {
          // If not authenticated, use only the local wishlist
          setWishlist(localWishlist);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    };

    fetchWishlistData();
  }, [isAuthenticated, user]);

  // Sync wishlist state with localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Add to wishlist
  const addToWishlistHandler = async (productId: number) => {
    if (isAuthenticated) {
      try {
        // Add to wishlist in the backend
        await addToWishlist(productId); // Call the backend API to add the product
        const product = await fetchProductById(productId); // Fetch product details from the backend

        // Update the local wishlist state with the real product data
        setWishlist((prev) => [
          ...prev,
          {
            id: Date.now(), // Generate a temporary ID
            product, // Real product data
          },
        ]);
      } catch (error) {
        console.error('Failed to add item to wishlist:', error);
      }
    } else {
      try {
        // Fetch product details for unauthenticated users
        const product = await fetchProductById(productId);

        // Update the local wishlist state
        const newWishlist = [
          ...wishlist,
          {
            id: Date.now(), // Temporary ID for unauthenticated users
            product, // Real product data
          },
        ];
        setWishlist(newWishlist);
      } catch (error) {
        console.error('Failed to fetch product details:', error);
      }
    }
  };

  // Remove from wishlist
  const removeFromWishlistHandler = async (id: string) => {
    if (isAuthenticated) {
      try {
        // Remove from wishlist in the backend
        await deleteFromWishlist(id);
        setWishlist((prev) => prev.filter((item) => item.id.toString() !== id));
      } catch (error) {
        console.error('Failed to remove item from wishlist:', error);
      }
    } else {
      const newWishlist = wishlist.filter((item) => item.id.toString() !== id);
      setWishlist(newWishlist);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        addToWishlist: addToWishlistHandler,
        removeFromWishlist: removeFromWishlistHandler,
        isAuthenticated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
