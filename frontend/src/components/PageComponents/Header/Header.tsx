import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import UserIcon from '../../UI/Icons/User';
import HeartIcon from '../../UI/Icons/Heart';
import CartIcon from '../../UI/Icons/Cart';
import MenuIcon from '../../UI/Icons/Menu';
import Navigation from '../../Navigation/Navigation';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { headerMenuItems } from '../../../lists/headerMenuItems';
import SideBarMobile from '../SideBarMobile';
import SidebarCart from '../CartSidebar';
import SidebarWishlist from '../WishlistSidebar';
import SearchBar from './SearchBar';
import TopBar from './TopBar';
import CategoryButton from './CategoryButton';

interface HeaderProps {
  layout: string;
}

const Header: React.FC<HeaderProps> = ({ layout }) => {
  const { state: cartState } = useCart();
  const { isAuthenticated, signout } = useAuth();
  const { wishlistCount } = useWishlist();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const [menuItems, setMenuItems] = useState<any[]>([]);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const toggleWishlist = useCallback(() => {
    setIsWishlistOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const items = await headerMenuItems();
      setMenuItems(items);
    };
    fetchMenuItems();
  }, []);

  return (
    <div className="sticky top-0 bg-white shadow-sm w-full z-40">
      <div className="hidden md:block">
        <TopBar />
      </div>
      <div className="relative bg-white dark:bg-neutral-900">
        <div
          className={`mx-auto px-4 sm:px-6 lg:px-8 sm:py-2 lg:py-6 ${
            layout === 'dashboard' ? '' : 'container'
          }`}
        >
          <div className="h-14 flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center p-2">
              <img
                src="/logo.png"
                alt="Logivis Automotive"
                className="h-10 sm:h-16 w-auto"
              />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 hidden lg:flex justify-center mx-4">
              <SearchBar />
            </div>

            {/* Right Icons */}
            <div className="flex items-center justify-end space-x-2 text-slate-700 dark:text-slate-100">
              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                className="p-3 relative group hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
              >
                <HeartIcon size={28} className="stroke-gray-700 stroke-[10]" />
                {wishlistCount > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {wishlistCount}
                  </div>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="p-3 relative group hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
              >
                <CartIcon />
                {cartState.items.length > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {cartState.items.length}
                  </div>
                )}
              </button>
              {/* Mobile Menu Button (always menu icon) */}
              <div className="flex items-center md:hidden ml-auto">
                <button
                  onClick={toggleDrawer}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900"
                  aria-label="menu"
                >
                  <MenuIcon />
                </button>
              </div>
              <SidebarCart isOpen={isCartOpen} onClose={toggleCart} />
              <SidebarWishlist
                isOpen={isWishlistOpen}
                onClose={toggleWishlist}
              />

              {/* Auth Links */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 items-center justify-center"
                  >
                    <UserIcon />
                  </Link>
                  <button
                    onClick={signout}
                    className="hidden md:flex items-center px-2 font-semibold text-gray-800 hover:text-blue-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/signin"
                  className="hidden md:flex items-center px-2 font-semibold text-gray-800 hover:text-blue-600"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (slides in from right) */}
      <div
        className="fixed top-0 right-0 z-50 w-60 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out"
        style={{
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Close Button inside sidebar */}

        <button
          onClick={toggleDrawer}
          className="absolute top-4 right-4 z-[60] text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-xl"
        >
          &times;
        </button>
        <SideBarMobile />
      </div>

      {/* Main Menu Items + Category Button (Large screens only) */}
      <div className="container mx-auto hidden lg:flex items-center px-8 py-2">
        <CategoryButton />
        <ul className="flex gap-2 ml-4">
          {menuItems.map((item, index) => (
            <Navigation key={index} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Header;
