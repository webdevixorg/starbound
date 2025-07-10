import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '../../UI/Icons/Menu';
import { useAuth } from '../../../context/AuthContext';
import SideBarMobile from '../SideBarMobile';

const DashboardHeader: React.FC = () => {
  const { isAuthenticated, signout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logivis Automotive"
            className="h-10 w-auto"
          />
        </Link>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* User profile / Sign out */}
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className="hidden sm:inline text-sm text-gray-700 hover:text-blue-600"
              >
                Visit Logivis
              </Link>

              <button
                onClick={signout}
                className="hidden sm:inline text-sm text-gray-700 hover:text-blue-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="text-sm text-gray-700 hover:text-blue-600"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu */}
          <button
            onClick={toggleDrawer}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Sidebar for Mobile */}
      <div
        className="fixed top-0 right-0 z-50 w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out"
        style={{
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <button
          onClick={toggleDrawer}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
        >
          &times;
        </button>
        <SideBarMobile />
      </div>
    </header>
  );
};

export default DashboardHeader;
