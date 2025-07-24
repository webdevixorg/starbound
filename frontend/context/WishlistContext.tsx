'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  fetchWishlist,
  addToWishlist as apiAddToWishlist,
  deleteFromWishlist as apiDeleteFromWishlist,
} from '@/services/api';
import { fetchProductById } from '@/services/apiProducts';
import { useAuth } from './AuthContext';

// Enhanced interfaces
interface WishlistProduct {
  id: number;
  title: string;
  price: number;
  description?: string;
  location_name?: string;
  slug?: string;
  category?: string;
  rating?: number;
  reviews_count?: number;
  images?: Array<{
    image_path: string;
    alt?: string;
  }>;
  image?: string; // Fallback for older format
}

interface WishlistItem {
  id: number;
  product: WishlistProduct;
  added_at?: string;
  user_id?: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const { user } = useAuth();

  // Local storage key
  const LOCAL_STORAGE_KEY = 'starbound_wishlist';

  // Get local wishlist from localStorage
  const getLocalWishlist = useCallback((): WishlistItem[] => {
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error('Error parsing local wishlist:', error);
      return [];
    }
  }, []);

  // Save wishlist to localStorage
  const saveLocalWishlist = useCallback((wishlistData: WishlistItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlistData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch and sync wishlist data
  const fetchWishlistData = useCallback(async () => {
    if (isLoading) return; // Prevent multiple concurrent calls

    setIsLoading(true);
    setError(null);

    try {
      const localWishlist = getLocalWishlist();

      if (isAuthenticated && user) {
        // Fetch from backend
        const dbWishlist = await fetchWishlist();

        // Combine local and database wishlist, avoiding duplicates
        const combinedWishlist = [...dbWishlist];

        // Add local items that aren't in the database
        for (const localItem of localWishlist) {
          const existsInDb = dbWishlist.some(
            (dbItem: WishlistItem) => dbItem.product.id === localItem.product.id
          );

          if (!existsInDb) {
            try {
              // Add to backend
              await apiAddToWishlist(localItem.product.id);
              combinedWishlist.push(localItem);
            } catch (error) {
              console.error('Failed to sync local item to backend:', error);
              // Still add to local state even if backend sync fails
              combinedWishlist.push(localItem);
            }
          }
        }

        setWishlist(combinedWishlist);
        saveLocalWishlist(combinedWishlist);
      } else {
        // Not authenticated - use local storage only
        setWishlist(localWishlist);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setError('Failed to load wishlist. Please try again.');

      // Fallback to local storage on error
      const localWishlist = getLocalWishlist();
      setWishlist(localWishlist);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [isAuthenticated, user, getLocalWishlist, saveLocalWishlist, isLoading]);

  // Initial fetch
  useEffect(() => {
    if (!isInitialized) {
      fetchWishlistData();
    }
  }, [fetchWishlistData, isInitialized]);

  // Refresh wishlist
  const refreshWishlist = useCallback(async () => {
    setIsInitialized(false);
    await fetchWishlistData();
  }, [fetchWishlistData]);

  // Add to wishlist
  const addToWishlistHandler = useCallback(
    async (productId: number) => {
      if (isLoading) return;

      // Check if already in wishlist
      const existingItem = wishlist.find(
        (item) => item.product.id === productId
      );
      if (existingItem) {
        setError('Item is already in your wishlist');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch product details first
        const product = await fetchProductById(productId);

        if (!product) {
          throw new Error('Product not found');
        }

        const newItem: WishlistItem = {
          id: Date.now(), // Temporary ID
          product,
          added_at: new Date().toISOString(),
          user_id: user?.id,
        };

        if (isAuthenticated && user) {
          // Add to backend first
          await apiAddToWishlist(productId);
          // If your backend returns an id, update apiAddToWishlist to return it and handle here.
        }

        // Update local state
        const updatedWishlist = [...wishlist, newItem];
        setWishlist(updatedWishlist);
        saveLocalWishlist(updatedWishlist);
      } catch (error) {
        console.error('Failed to add item to wishlist:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to add item to wishlist. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [wishlist, isAuthenticated, user, saveLocalWishlist, isLoading]
  );

  // Remove from wishlist
  const removeFromWishlistHandler = useCallback(
    async (id: string) => {
      if (isLoading) return;

      const itemToRemove = wishlist.find((item) => item.id.toString() === id);
      if (!itemToRemove) {
        setError('Item not found in wishlist');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      const updatedWishlist = wishlist.filter(
        (item) => item.id.toString() !== id
      );
      setWishlist(updatedWishlist);
      saveLocalWishlist(updatedWishlist);

      try {
        if (isAuthenticated && user) {
          await apiDeleteFromWishlist(id);
        }
      } catch (error) {
        console.error('Failed to remove item from wishlist:', error);

        // Revert optimistic update on error
        setWishlist(wishlist);
        saveLocalWishlist(wishlist);

        setError('Failed to remove item from wishlist. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [wishlist, isAuthenticated, user, saveLocalWishlist, isLoading]
  );

  // Clear entire wishlist
  const clearWishlistHandler = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    // Optimistically clear UI
    const originalWishlist = [...wishlist];
    setWishlist([]);
    saveLocalWishlist([]);

    try {
      if (isAuthenticated && user) {
        // Clear all items from backend
        await Promise.all(
          originalWishlist.map((item) =>
            apiDeleteFromWishlist(item.id.toString()).catch((err) =>
              console.error(`Failed to delete item ${item.id}:`, err)
            )
          )
        );
      }
    } catch (error) {
      console.error('Failed to clear wishlist:', error);

      // Revert on error
      setWishlist(originalWishlist);
      saveLocalWishlist(originalWishlist);

      setError('Failed to clear wishlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [wishlist, isAuthenticated, user, saveLocalWishlist, isLoading]);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: number): boolean => {
      return wishlist.some((item) => item.product.id === productId);
    },
    [wishlist]
  );

  // Sync with localStorage whenever wishlist changes
  useEffect(() => {
    if (isInitialized) {
      saveLocalWishlist(wishlist);
    }
  }, [wishlist, saveLocalWishlist, isInitialized]);

  const contextValue: WishlistContextType = {
    wishlist,
    wishlistCount: wishlist.length,
    isLoading,
    error,
    addToWishlist: addToWishlistHandler,
    removeFromWishlist: removeFromWishlistHandler,
    clearWishlist: clearWishlistHandler,
    isInWishlist,
    refreshWishlist,
    isAuthenticated,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
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

// Export types for use in other components
export type { WishlistItem, WishlistProduct, WishlistContextType };
