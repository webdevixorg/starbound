import React from 'react';
import Link from 'next/link';

const SideBarMobile: React.FC = () => {
  return (
    <div className="md:hidden w-60 bg-white shadow-lg fixed left-0 top-0 h-full p-4">
      <ul className="space-y-2">
        {[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/products' },
          { label: 'Services', href: '/services' },
          { label: 'Blog', href: '/posts' },
        ].map((item, index) => (
          <li key={index}>
            <Link
              href={item.href}
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
          { label: 'Profile', href: '/profile' },
          { label: 'Settings', href: '/settings' },
          { label: 'Logout', href: '/logout' }, // You can later replace with a signout function
        ].map((item, index) => (
          <li key={index}>
            <Link
              href={item.href}
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
