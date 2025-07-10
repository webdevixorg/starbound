import React from 'react';
import { Link } from 'react-router-dom';
import CogWheelIcon from '../../UI/Icons/CogWheel';
import CartIcon from '../../UI/Icons/Cart';
import { ShieldIcon } from '../../UI/Icons/Sheald';
import HeartIcon from '../../UI/Icons/Heart';

type SummaryCardProps = {
  title: string;
  count: number | string;
  href: string;
  color: 'blue' | 'green' | 'yellow';
  icon?: 'orders' | 'wishlist' | 'reviews'; // Optional icon type
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
  };

  const iconMap: Record<string, React.ReactNode> = {
    orders: <CartIcon className="w-8 h-8" stroke="#3b82f6" />,
    wishlist: <HeartIcon className="w-8 h-8" stroke="#10b981" />,
    reviews: <ShieldIcon />,
  };

  return (
    <div className="rounded-2xl flex flex-col dark:bg-slate-900/70 bg-white shadow-sm">
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
            className="p-1 rounded-sm bg-gray-100 text-black dark:bg-slate-800 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700"
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
            <h1 className="text-3xl font-semibold">{count}</h1>
          </div>
          <div className={`h-16 flex items-center ${colorMap[color].icon}`}>
            {iconMap[icon]}
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-4 text-right">
          <Link
            to={href}
            className={`inline-block px-4 py-2 text-sm font-medium text-white rounded-full ${colorMap[color].badge} transition`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
