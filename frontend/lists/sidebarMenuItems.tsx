import React, { ReactNode } from 'react';
import Heart from '@/components/UI/Icons/Heart';
import Cart from '@/components/UI/Icons/Cart';
import User from '@/components/UI/Icons/User';
import BellIcon from '@/components/UI/Icons/Bell';
import CogWheelIcon from '@/components/UI/Icons/CogWheel';
import SMSIcon from '@/components/UI/Icons/Sms';
import UpdateIcon from '@/components/UI/Icons/Update';
import SupportIcon from '@/components/UI/Icons/Support';
import HelpIcon from '@/components/UI/Icons/Help';
import FeedBackIcon from '@/components/UI/Icons/FeedBack';
import HistoryIcon from '@/components/UI/Icons/History';
import DashBoardIcon from '@/components/UI/Icons/DashBoard';
import ArticleIcon from '@/components/UI/Icons/Article';
import ProductIcon from '@/components/UI/Icons/Product';

interface SubLink {
  href: string;
  icon: ReactNode;
  label: string;
}

interface MenuItem {
  alert: boolean | undefined;
  href: string;
  icon: ReactNode;
  text: string;
  subLinks?: SubLink[];
  type: ('admin' | 'staff' | 'client' | 'all')[];
}

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
    href: '/profile/orders',
    icon: <Cart size={20} />,
    text: 'My Orders',
    alert: true,
    type: ['client'],
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

const supportItems: MenuItem[] = [
  {
    href: '/profile/contact-support',
    icon: <SupportIcon size={20} />,
    text: 'Contact Support',
    alert: false,
    type: ['all'],
  },
  {
    href: '/profile/help-center',
    icon: <HelpIcon size={20} />,
    text: 'Help Center',
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

const sidebarMenuItems: MenuItem[] = [
  ...menuItems,
  ...personalInfoItems,
  ...notificationsItems,
  ...supportItems,
];

export default sidebarMenuItems;
