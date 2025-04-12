import EyeIcon from '../components/UI/Icons/Eye';
import { ReactNode } from 'react';

interface SubLink {
  to: string;
  icon: ReactNode;
  label: string;
}

interface MenuItem {
  alert: boolean | undefined;
  to: string;
  icon: ReactNode;
  text: string;
  subLinks?: SubLink[];
  type: 'admin' | 'customer' | 'all'; // Added type property
}

const menuItems: MenuItem[] = [
  {
    to: '/profile',
    icon: <EyeIcon size={20} />,
    text: 'Dashboard',
    alert: true,
    type: 'all', // Added type
  },
  {
    to: '/wishlist',
    icon: <EyeIcon size={20} />,
    text: 'Wishlist',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/orders',
    icon: <EyeIcon size={20} />,
    text: 'Orders',
    alert: true,
    type: 'admin', // Added type
  },
  {
    to: '/orders',
    icon: <EyeIcon size={20} />,
    text: 'My Orders',
    alert: true,
    type: 'customer', // Added type
  },
  {
    to: '/history',
    icon: <EyeIcon size={20} />,
    text: 'History',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '#',
    icon: <EyeIcon size={20} />,
    text: 'Posts',
    subLinks: [
      { to: '/posts/list', icon: <EyeIcon size={20} />, label: 'All Posts' },
      { to: '/posts/add-new', icon: <EyeIcon size={20} />, label: 'Add Post' },
      {
        to: '/posts/categories',
        icon: <EyeIcon size={20} />,
        label: 'Post Categories',
      },
    ],
    alert: false,
    type: 'admin', // Added type
  },
  {
    to: '#',
    icon: <EyeIcon size={20} />,
    text: 'Products',
    subLinks: [
      {
        to: '/products/list',
        icon: <EyeIcon size={20} />,
        label: 'All Products',
      },
      {
        to: '/products/add-new',
        icon: <EyeIcon size={20} />,
        label: 'Add Products',
      },
      {
        to: '/products/categories',
        icon: <EyeIcon size={20} />,
        label: 'Product Categories',
      },
    ],
    alert: false,
    type: 'admin', // Added type
  },
];

const personalInfoItems: MenuItem[] = [
  {
    to: '/edit-profile',
    icon: <EyeIcon size={20} />,
    text: 'Edit Profile',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/settings',
    icon: <EyeIcon size={20} />,
    text: 'Settings',
    alert: false,
    type: 'all', // Added type
  },
];

const notificationsItems: MenuItem[] = [
  {
    to: '/messages',
    icon: <EyeIcon size={20} />,
    text: 'Messages',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/notifications',
    icon: <EyeIcon size={20} />,
    text: 'Notifications',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/updates',
    icon: <EyeIcon size={20} />,
    text: 'Updates',
    alert: false,
    type: 'all', // Added type
  },
];

const supportItems: MenuItem[] = [
  {
    to: '/contact-support',
    icon: <EyeIcon size={20} />,
    text: 'Contact Support',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/help-center',
    icon: <EyeIcon size={20} />,
    text: 'Help Center',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/feedback',
    icon: <EyeIcon size={20} />,
    text: 'Feedback',
    alert: false,
    type: 'all', // Added type
  },
];

const sidebarMenuItems: MenuItem[] = [
  ...menuItems,
  ...personalInfoItems,
  ...notificationsItems,
  ...supportItems,
];

export default sidebarMenuItems;
