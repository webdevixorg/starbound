'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ArrowRotateIcon from '@/components/UI/Icons/ArrowRotate';
import { SidebarContext } from './ProfileSidebar';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  alert?: boolean;
  subLinks?: { href: string; label: string }[];
}

export function SidebarItem({
  icon,
  text,
  href,
  alert,
  subLinks,
}: SidebarItemProps) {
  const { expanded, setExpanded } = useContext(SidebarContext);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href;

  const handleSubmenuToggle = () => {
    setIsSubmenuOpen((prev) => !prev);
  };

  const handleMainItemClick = () => {
    if (subLinks) {
      handleSubmenuToggle();
    } else {
      router.push(href);
    }
  };

  return (
    <li
      className={`relative block items-center py-2 px-2 my-1 font-medium rounded-sm cursor-pointer transition-colors group ${
        isActive
          ? 'bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800'
          : 'hover:bg-indigo-50 text-gray-600'
      }`}
      onClick={handleMainItemClick}
    >
      <div className="flex items-center">
        {alert && (
          <div
            className={`absolute w-2 h-2 rounded bg-indigo-400 ${
              expanded ? 'top-2 left-0' : 'top-2 left-0'
            }`}
          ></div>
        )}
        <span className={`transition-all ${expanded ? 'text-red-600' : ''}`}>
          {icon}
        </span>
        <span
          className={`overflow-hidden transition-all ${
            expanded ? 'w-52 ml-3' : 'w-0'
          }`}
        >
          {text}
        </span>

        <button onClick={() => setExpanded((curr) => !curr)}>
          {subLinks && expanded && (
            <ArrowRotateIcon rotation={isSubmenuOpen ? 0 : 90} />
          )}
        </button>
      </div>

      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
      {subLinks && isSubmenuOpen && expanded && (
        <ul className="space-y-2 py-2">
          {subLinks.map((subLink) => (
            <li key={subLink.href} className="py-1">
              <Link
                href={subLink.href}
                className="flex items-center justify-center text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 group w-full pl-4 transition duration-75"
                onClick={(e) => e.stopPropagation()} // Prevent submenu toggle on click
              >
                <span className="flex-1 whitespace-nowrap px-3">
                  {subLink.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
