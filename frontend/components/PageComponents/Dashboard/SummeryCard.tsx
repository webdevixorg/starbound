import React from 'react';
import Link from 'next/link';
import CogWheelIcon from '@/components/UI/Icons/CogWheel';
import CartIcon from '@/components/UI/Icons/Cart';
import { ShieldIcon } from '@/components/UI/Icons/Sheald';
import HeartIcon from '@/components/UI/Icons/Heart';

type SummaryCardProps = {
  title: string;
  count: number | string;
  href: string;
  color: 'blue' | 'green' | 'yellow' | 'purple'; // Added purple
  icon?: 'orders' | 'wishlist' | 'reviews' | 'forum'; // Added forum
};

const SummaryCard = ({
  title,
  count,
  href,
  color,
  icon = 'orders',
}: SummaryCardProps) => {
  const colorMap = {
    blue: {
      badge: 'bg-blue-500 border-blue-500 text-white',
      icon: 'text-blue-500',
    },
    green: {
      badge: 'bg-emerald-500 border-emerald-500 text-white',
      icon: 'text-emerald-500',
    },
    yellow: {
      badge: 'bg-yellow-500 border-yellow-500 text-white',
      icon: 'text-yellow-500',
    },
    purple: {
      badge: 'bg-purple-500 border-purple-500 text-white',
      icon: 'text-purple-500',
    },
  };

  // Forum Icon Component
  const ForumIcon = ({
    className,
    stroke,
  }: {
    className?: string;
    stroke?: string;
  }) => (
    <svg
      className={className}
      fill="none"
      stroke={stroke || 'currentColor'}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );

  const iconMap: Record<string, React.ReactNode> = {
    orders: <CartIcon className="w-8 h-8" stroke="#3b82f6" />,
    wishlist: <HeartIcon className="w-8 h-8" stroke="#10b981" />,
    reviews: <ShieldIcon />,
    forum: <ForumIcon className="w-8 h-8" stroke="#8b5cf6" />,
  };

  return (
    <div className="rounded-2xl flex flex-col dark:bg-slate-900/70 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex-1 p-6">
        {/* Top badge and settings button */}
        <div className="flex justify-between items-center mb-3">
          <div
            className={`inline-flex items-center text-xs border rounded-full py-1 px-3 ${colorMap[color].badge}`}
          >
            <span>{title}</span>
          </div>
          <button
            type="button"
            className="p-1 rounded-sm bg-gray-100 text-black dark:bg-slate-800 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <CogWheelIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg text-gray-500 dark:text-slate-400">
              {title}
            </h3>
            <h1 className="text-3xl font-semibold dark:text-white">{count}</h1>
          </div>
          <div className={`h-16 flex items-center ${colorMap[color].icon}`}>
            {iconMap[icon]}
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-4 text-right">
          <Link
            href={href}
            className={`inline-block px-4 py-2 text-sm font-medium text-white rounded-full ${colorMap[color].badge} hover:opacity-90 transition-opacity`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
