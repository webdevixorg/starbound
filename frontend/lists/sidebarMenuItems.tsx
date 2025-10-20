/**
 * This file defines the structure and content of the sidebar navigation menu.
 * It includes different menu items based on user roles and functionality areas.
 */

import React, { ReactNode } from 'react';
// Import icons used in the sidebar menu
import Heart from '@/components/UI/Icons/Heart';
import Cart from '@/components/UI/Icons/Cart';
import User from '@/components/UI/Icons/User';
import BellIcon from '@/components/UI/Icons/Bell';
import CogWheelIcon from '@/components/UI/Icons/CogWheel';
import SMSIcon from '@/components/UI/Icons/Sms';
import UpdateIcon from '@/components/UI/Icons/Update';
import SupportIcon from '@/components/UI/Icons/Support';
import FeedBackIcon from '@/components/UI/Icons/FeedBack';
import HistoryIcon from '@/components/UI/Icons/History';
import DashBoardIcon from '@/components/UI/Icons/DashBoard';
import ArticleIcon from '@/components/UI/Icons/Article';
import ProductIcon from '@/components/UI/Icons/Product';

/**
 * Interface defining the structure of submenu items
 * @interface SubLink
 * @property {string} href - The URL the submenu item links to
 * @property {ReactNode} icon - Icon component to display (optional)
 * @property {string} label - Display text for the submenu item
 */
interface SubLink {
  href: string;
  icon: ReactNode;
  label: string;
}

/**
 * Interface defining the structure of main menu items
 * @interface MenuItem
 * @property {boolean | undefined} alert - Whether to show an alert indicator
 * @property {string} href - The URL the menu item links to
 * @property {ReactNode} icon - Icon component to display
 * @property {string} text - Display text for the menu item
 * @property {SubLink[]} [subLinks] - Optional array of submenu items
 * @property {Array<'admin' | 'staff' | 'client' | 'all'>} type - User roles that can see this item
 */
export interface MenuItem {
  alert: boolean | undefined;
  href: string;
  icon: ReactNode;
  text: string;
  subLinks?: SubLink[];
  type: ('admin' | 'staff' | 'client' | 'all')[];
}

/**
 * Main navigation menu items
 * Includes primary functionality like dashboard, wishlist, orders, etc.
 */
const menuItems: MenuItem[] = [
  {
    href: '/profile/dashboard',
    icon: <DashBoardIcon size={20} />,
    text: 'Dashboard',
    alert: true,
    type: ['all'],
  },
  {
    href: '/profile/wishlist',
    icon: <Heart size={20} />,
    text: 'Wishlist',
    alert: false,
    type: ['all'],
  },
  {
    href: '/profile/orders',
    icon: <Cart size={20} />,
    text: 'Orders',
    alert: true,
    type: ['admin', 'staff'],
  },
  {
    href: '/profile/my-orders',
    icon: <Cart size={20} />,
    text: 'My Orders',
    alert: false,
    type: ['all'],
  },
  {
    href: '/profile/history',
    icon: <HistoryIcon size={20} />,
    text: 'History',
    alert: false,
    type: ['client'],
  },
  {
    href: '/profile/reviews',
    icon: <HistoryIcon size={20} />,
    text: 'Reviews',
    alert: false,
    type: ['admin', 'staff'],
  },
  {
    href: '/profile/my-reviews',
    icon: <HistoryIcon size={20} />,
    text: 'My Reviews',
    alert: false,
    type: ['client'],
  },
  {
    href: '/profile/forum',
    icon: <HistoryIcon size={20} />,
    text: 'Forum',
    alert: false,
    type: ['all'],
  },
  {
    href: '#',
    icon: <ArticleIcon size={20} />,
    text: 'Posts',
    subLinks: [
      { href: '/profile/posts', icon: '', label: 'All Posts' },
      { href: '/profile/posts/add-post', icon: '', label: 'Add Post' },
      {
        href: '/profile/categories?type=post',
        icon: '',
        label: 'Post Categories',
      },
    ],
    alert: false,
    type: ['admin', 'staff'],
  },
  {
    href: '#',
    icon: <ProductIcon size={20} />,
    text: 'Products',
    subLinks: [
      {
        href: '/profile/products',
        icon: '',
        label: 'All Products',
      },
      {
        href: '/profile/products/add-product',
        icon: '',
        label: 'Add Products',
      },
      {
        href: '/profile/categories?type=product',
        icon: '',
        label: 'Product Categories',
      },
    ],
    alert: false,
    type: ['admin', 'staff'],
  },
];

/**
 * Personal information related menu items
 * Contains items for profile management and user settings
 */
const personalInfoItems: MenuItem[] = [
  {
    href: '/profile/edit-profile',
    icon: <User />,
    text: 'Edit Profile',
    alert: false,
    type: ['all'],
  },
  {
    href: '/profile/settings',
    icon: <CogWheelIcon size={20} />,
    text: 'Settings',
    alert: false,
    type: ['all'],
  },
];

/**
 * Notification related menu items
 * Handles user communication and system updates
 */
const notificationsItems: MenuItem[] = [
  {
    href: '/profile/messages',
    icon: <SMSIcon size={20} />,
    text: 'Messages',
    alert: false,
    type: ['all'],
  },
  {
    href: '/profile/notifications',
    icon: <BellIcon size={20} />,
    text: 'Notifications',
    alert: false,
    type: ['all'],
  },
  {
    href: '/profile/updates',
    icon: <UpdateIcon size={20} />,
    text: 'Updates',
    alert: false,
    type: ['all'],
  },
];

/**
 * Support and help related menu items
 * Provides access to support features and feedback options
 */
const supportItems: MenuItem[] = [
  {
    href: '/profile/contact-support',
    icon: <SupportIcon size={20} />,
    text: 'Contact Support',
    alert: false,
    type: ['all'],
  },
  {
    href: '/profile/feedback',
    icon: <FeedBackIcon size={20} />,
    text: 'Feedback',
    alert: false,
    type: ['all'],
  },
];

/**
 * Combined sidebar menu items array
 * Merges all menu item categories into a single array for the sidebar
 * Order:
 * 1. Main menu items (dashboard, orders, etc.)
 * 2. Personal information items (profile, settings)
 * 3. Notification items (messages, alerts)
 * 4. Support items (help, feedback)
 */
const sidebarMenuItems: MenuItem[] = [
  ...menuItems,
  ...personalInfoItems,
  ...notificationsItems,
  ...supportItems,
];

export default sidebarMenuItems;
