import React, { useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import ArrowDownIcon from '../UI/Icons/ArrowDown';
import MegaMenu from './MegaMenu';

interface SubItem {
  label: string;
  href: string;
}

interface MenuItem {
  title: string;
  items: SubItem[];
}

interface NavigationItemBase {
  label: string;
  href: string;
  direct?: boolean;
}

interface NavigationItemWithSubItems extends NavigationItemBase {
  subItems?: SubItem[];
  megaMenu?: undefined;
}

interface NavigationItemWithMegaMenu extends NavigationItemBase {
  megaMenu: boolean;
  items: MenuItem[];
  subItems?: undefined;
}

type NavigationItem = NavigationItemWithSubItems | NavigationItemWithMegaMenu;

interface NavigationProps {
  item: NavigationItem;
}

const Navigation: React.FC<NavigationProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <Popover
      as="li"
      className={`menu-item ${!item.megaMenu ? 'relative' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {() => (
        <>
          {item.direct ? (
            <a
              className="inline-flex items-center text-base text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full 
              hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition duration-150 ease-in-out"
              href={item.href}
            >
              {item.label}
            </a>
          ) : (
            <Popover.Button as="div" className="flex items-center">
              <a
                className="inline-flex items-center text-base text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full 
              hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition duration-150 ease-in-out"
                href={item.href}
              >
                {item.label}
                <ArrowDownIcon />
              </a>
            </Popover.Button>
          )}
          {item.subItems && (
            <Transition
              show={isOpen}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              <Popover.Panel className="absolute py-5">
                <ul className="py-2 bg-white z-20 shadow w-48">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.href} className="px-1 py-1">
                      <a
                        className="block px-3 py-1 text-sm text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 rounded-md transition duration-150 ease-in-out"
                        href={subItem.href}
                      >
                        {subItem.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Popover.Panel>
            </Transition>
          )}
          {item.megaMenu && (
            <MegaMenu
              isOpen={isOpen}
              menuItems={item.items}
              label={item.label}
            />
          )}
        </>
      )}
    </Popover>
  );
};

export default Navigation;
