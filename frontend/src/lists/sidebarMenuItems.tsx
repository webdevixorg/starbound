import { ReactNode } from 'react';
import Heart from '../components/UI/Icons/Heart';
import Cart from '../components/UI/Icons/Cart';
import User from '../components/UI/Icons/User';
import BellIcon from '../components/UI/Icons/Bell';
import CogWheelIcon from '../components/UI/Icons/CogWheel';
import SMSIcon from '../components/UI/Icons/Sms';
import UpdateIcon from '../components/UI/Icons/Update';
import SupportIcon from '../components/UI/Icons/Support';
import HelpIcon from '../components/UI/Icons/Help';
import FeedBackIcon from '../components/UI/Icons/FeedBack';
import HistoryIcon from '../components/UI/Icons/History';
import DashBoardIcon from '../components/UI/Icons/DashBoard';
import ArticleIcon from '../components/UI/Icons/Article';
import ProductIcon from '../components/UI/Icons/Product';

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
    to: '/dashboard',
    icon: <DashBoardIcon size={20} />,
    text: 'Dashboard',
    alert: true,
    type: 'all', // Added type
  },
  {
    to: '/wishlist',
    icon: <Heart size={20} />,
    text: 'Wishlist',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/orders',
    icon: <Cart size={20} />,
    text: 'Orders',
    alert: true,
    type: 'admin', // Added type
  },
  {
    to: '/orders',
    icon: <Cart size={20} />,
    text: 'My Orders',
    alert: true,
    type: 'customer', // Added type
  },
  {
    to: '/history',
    icon: <HistoryIcon size={20} />,
    text: 'History',
    alert: false,
    type: 'customer', // Added type
  },
  {
    to: '/all-reviews',
    icon: <HistoryIcon size={20} />,
    text: 'All Reviews',
    alert: false,
    type: 'admin', // Added type
  },
  {
    to: '/reviews',
    icon: <HistoryIcon size={20} />,
    text: 'Reviews',
    alert: false,
    type: 'customer', // Added type
  },
  {
    to: '#',
    icon: <ArticleIcon size={20} />,
    text: 'Posts',
    subLinks: [
      { to: '/posts/list', icon: '', label: 'All Posts' },
      { to: '/posts/add-new', icon: '', label: 'Add Post' },
      {
        to: '/posts/categories',
        icon: '',
        label: 'Post Categories',
      },
    ],
    alert: false,
    type: 'admin', // Added type
  },
  {
    to: '#',
    icon: <ProductIcon size={20} />,
    text: 'Products',
    subLinks: [
      {
        to: '/products/list',
        icon: '',
        label: 'All Products',
      },
      {
        to: '/products/add-new',
        icon: '',
        label: 'Add Products',
      },
      {
        to: '/products/categories',
        icon: '',
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
    icon: <User />,
    text: 'Edit Profile',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/settings',
    icon: <CogWheelIcon size={20} />,
    text: 'Settings',
    alert: false,
    type: 'all', // Added type
  },
];

const notificationsItems: MenuItem[] = [
  {
    to: '/messages',
    icon: <SMSIcon size={20} />,
    text: 'Messages',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/notifications',
    icon: <BellIcon size={20} />,
    text: 'Notifications',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/updates',
    icon: <UpdateIcon size={20} />,
    text: 'Updates',
    alert: false,
    type: 'all', // Added type
  },
];

const supportItems: MenuItem[] = [
  {
    to: '/contact-support',
    icon: <SupportIcon size={20} />,
    text: 'Contact Support',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/help-center',
    icon: <HelpIcon size={20} />,
    text: 'Help Center',
    alert: false,
    type: 'all', // Added type
  },
  {
    to: '/feedback',
    icon: <FeedBackIcon size={20} />,
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
