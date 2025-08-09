'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import UserIcon from '@/components/UI/Icons/User';
import HeartIcon from '@/components/UI/Icons/Heart';
import CartIcon from '@/components/UI/Icons/Cart';
import MenuIcon from '@/components/UI/Icons/Menu';
import SearchIcon from '@/components/UI/Icons/Search';
import Navigation from '@/components/Navigation/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { headerMenuItems } from '@/lists/headerMenuItems';
import SideBarMobile from '@/components/PageComponents/SideBarMobile';
import SidebarCart from '@/components/PageComponents/Sidebar/CartSidebar';
import SidebarWishlist from '@/components/PageComponents/WishlistSidebar';
import SearchBar from './SearchBar';
import TopBar from './TopBar';
import CategoryButton from './CategoryButton';

// Fix User type to include name property
interface User {
  id: string;
  name?: string;
  email?: string;
  // Add other user properties as needed
}

interface HeaderProps {
  layout?: 'default' | 'dashboard' | 'full-width';
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  layout = 'default',
  className = '',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { state: cartState } = useCart();
  const { isAuthenticated, user, signout } = useAuth();
  const { wishlistCount } = useWishlist();

  // State management
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Memoized values
  const cartItemCount = useMemo(
    () =>
      cartState.items
        ? cartState.items.reduce(
            (total: number, item: { quantity: number }) =>
              total + (item.quantity || 0),
            0
          )
        : 0,
    [cartState.items]
  );

  // Event handlers
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
    document.body.style.overflow = !isDrawerOpen ? 'hidden' : 'auto';
  }, [isDrawerOpen]);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const toggleWishlist = useCallback(() => {
    setIsWishlistOpen((prev) => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signout();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [signout, router]);

  // Effects
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await headerMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to load menu items:', error);
      }
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsSearchOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
    document.body.style.overflow = 'auto';
  }, [pathname]);

  const headerClasses = `
    sticky top-0 bg-white/95 backdrop-blur-md shadow-sm w-full z-40 transition-all duration-300
    ${isScrolled ? 'shadow-md bg-white/98' : 'shadow-sm'}
    ${className}
  `.trim();

  const containerClasses =
    layout === 'full-width'
      ? 'w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16'
      : 'container mx-auto px-4 sm:px-6 lg:px-8';

  return (
    <>
      <header className={headerClasses}>
        {/* Top Bar - Hidden on mobile */}
        <div className="hidden md:block border-b border-gray-100">
          <TopBar />
        </div>

        {/* Main Header */}
        <div className="relative bg-white/95 backdrop-blur-md">
          <div className={`${containerClasses} py-3 lg:py-4`}>
            <div className="flex justify-between items-center h-16 lg:h-20">
              {/* Logo Section */}
              <div className="flex items-center flex-shrink-0">
                <Link href="/" className="flex items-center group">
                  <div className="relative">
                    <NextImage
                      src="/logo.png"
                      alt={
                        process.env.NEXT_PUBLIC_COMPANY_NAME || 'Company Logo'
                      }
                      width={76}
                      height={32}
                      className="h-12 lg:h-16 w-auto"
                      style={{ width: 'auto', height: 'auto' }}
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Search Bar - Desktop */}
              <div className="flex-1 hidden lg:flex justify-center mx-8 max-w-2xl">
                <div className="w-full relative">
                  <SearchBar />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Mobile Search Button */}
                <button
                  onClick={toggleSearch}
                  className="lg:hidden p-2.5 relative group hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Open search"
                >
                  <SearchIcon className="w-6 h-6 text-gray-700" />
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  className="p-2.5 relative group hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={`Wishlist (${wishlistCount} items)`}
                >
                  <HeartIcon className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium animate-pulse">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </button>

                {/* Cart Button */}
                <button
                  onClick={toggleCart}
                  className="p-2.5 relative group hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={`Shopping cart (${cartItemCount} items)`}
                >
                  <CartIcon className="w-6 h-6 text-gray-700 group-hover:text-blue-500 transition-colors" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium animate-pulse">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>

                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center space-x-3">
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3">
                      <Link
                        href="/profile/dashboard"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <UserIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        {(user as unknown as User)?.name && (
                          <span className="text-sm font-medium text-gray-700 hidden lg:block">
                            {(user as unknown as User).name!.split(' ')[0]}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Link
                        href="/signin"
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleDrawer}
                  className="md:hidden p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Open menu"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Desktop */}
        <div className="hidden lg:block bg-white border-t border-gray-100">
          <div className={`${containerClasses} py-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <CategoryButton />
                <ul className="flex gap-2 ml-4">
                  {menuItems.map((item, index) => (
                    <Navigation key={index} item={item} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="bg-white p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSearch}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label="Close search"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <SearchBar />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 z-50 w-80 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={toggleDrawer}
            className="absolute top-4 right-4 z-10 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <SideBarMobile />
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleDrawer}
          aria-label="Close menu"
        />
      )}

      {/* Sidebars */}
      <SidebarCart isOpen={isCartOpen} onClose={toggleCart} />
      <SidebarWishlist isOpen={isWishlistOpen} onClose={toggleWishlist} />
    </>
  );
};

export default Header;
