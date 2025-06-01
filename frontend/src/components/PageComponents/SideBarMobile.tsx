import React from 'react';
import { Link } from 'react-router-dom';

const SideBarMobile: React.FC = () => {
  return (
    <div className="md:hidden w-60 bg-white shadow-lg fixed left-0 top-0 h-full p-4">
      <ul className="space-y-2">
        {[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/products' },
          { label: 'Services', to: '/services' },
          { label: 'Blog', to: '/posts' },
        ].map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              className="block p-2 hover:bg-gray-200 rounded cursor-pointer"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <hr className="my-4 border-gray-300" />

      <ul className="space-y-2">
        {[
          { label: 'Profile', to: '/profile' },
          { label: 'Settings', to: '/settings' },
          { label: 'Logout', to: '/logout' }, // You can later replace with a signout function
        ].map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              className="block p-2 hover:bg-gray-200 rounded cursor-pointer"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBarMobile;
