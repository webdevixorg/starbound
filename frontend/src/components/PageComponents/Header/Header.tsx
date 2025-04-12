import React, { useState } from 'react';
import UserIcon from '../../UI/Icons/User';
import BellIcon from '../../UI/Icons/Bell';
import CartIcon from '../../UI/Icons/Cart';
import LogoIcon from '../../UI/Icons/Logo';
import MenuIcon from '../../UI/Icons/Menu';
import Navigation from '../../Navigation/Navigation';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import headerMenuItems from '../../../lists/headerMenuItems';

import SideBarMobile from '../SideBarMobile';
import SidebarCart from '../CartSidebar';
import { useCart } from '../../../context/CartContext';
import SearchBar from './SearchBar';
import TopBar from './TopBar';
import CategoryButton from './CategoryButton';

interface HeaderProps {
  layout: string;
}

const Header: React.FC<HeaderProps> = ({ layout }) => {
  const { state } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const { isAuthenticated, signout } = useAuth();

  return (
    <div className="sticky top-0 bg-white shadow-sm w-full z-40">
      <TopBar />
      <div className="relative bg-white dark:bg-neutral-900">
        <div
          className={`mx-auto px-4 sm:px-6 lg:px-8 sm:py-2 lg:py-4 ${
            layout === 'profile' ? '' : 'container'
          } `}
        >
          <div className="h-14 flex justify-between">
            <div className="flex items-center sm:hidden">
              <div className="p-2.5 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none flex items-center justify-center">
                <button
                  className="absolute top-0 left-0 p-2 mr-2 text-gray-500 hover:text-gray-900"
                  aria-label="menu"
                  onClick={toggleDrawer}
                >
                  {isDrawerOpen ? 'x' : <MenuIcon />}
                </button>
              </div>
            </div>
            <div className="flex items-center p-2">
              <a
                className="inline-block text-primary-6000 flex-shrink-0"
                href="/"
              >
                <LogoIcon />
              </a>
            </div>
            <div className="flex-[2] hidden lg:flex justify-center mx-4">
              <SearchBar />
            </div>
            <div className="flex items-center justify-end text-slate-700 dark:text-slate-100">
              <div className="hidden sm:block relative">
                <button className="text-opacity-90 group p-3 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                  <span className="w-2 h-2 bg-blue-500 absolute top-2 right-2 rounded-full"></span>
                  <BellIcon />
                </button>
              </div>

              <div className="hidden sm:block relative">
                <button
                  onClick={toggleCart} // Add the click handler here
                  className="text-opacity-90 group p-3 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                >
                  <span className="w-2 h-2 bg-blue-500 absolute top-2 right-2 rounded-full"></span>
                  <CartIcon />
                  {state.items.length > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {state.items.length}
                      </div>
                    </div>
                  )}
                </button>
              </div>
              <SidebarCart isOpen={isCartOpen} onClose={toggleCart} />

              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center">
                    <Link
                      to="/profile"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none flex items-center justify-center"
                    >
                      <UserIcon />
                    </Link>
                  </div>
                  <div className="hidden md:flex items-center">
                    <button
                      onClick={signout}
                      className="nav-links flex items-center h-full px-1 font-semibold text-gray-800 hover:text-blue-600 hover:border-b-4 border-white"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center">
                  <Link
                    to="/signin"
                    className="nav-links flex items-center h-full px-1 font-semibold text-gray-800 hover:text-blue-600 hover:border-b-4 border-white"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="fixed top-0 left-0 z-50 flex flex-col w-60 bg-white shadow-lg"
        style={{
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <SideBarMobile />
      </div>
      <div className="container mx-auto hidden lg:flex justify-start items-center px-8">
        <CategoryButton />
        <ul className="items-center flex px-4">
          {headerMenuItems.map((item) => (
            <Navigation key={item.label} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Header;
