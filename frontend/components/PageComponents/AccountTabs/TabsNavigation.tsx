import React from 'react';
import {
  KeyIcon,
  ShieldCheckIcon,
  CogIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsNavigation: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'basic-info',
      label: 'Change Password',
      icon: KeyIcon,
      description: 'Update your password',
    },
    {
      id: 'account-security',
      label: 'Account Security',
      icon: ShieldCheckIcon,
      description: 'Two-factor authentication',
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: CogIcon,
      description: 'General settings',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: BellIcon,
      description: 'Alert preferences',
    },
  ];

  return (
    <div className="border-b border-gray-200/60">
      <div className="px-6 py-4">
        <nav className="flex space-x-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 border border-transparent hover:border-gray-200/60 hover:shadow-sm'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? 'text-white scale-110'
                      : 'text-gray-400 group-hover:text-blue-500'
                  }`}
                />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{tab.label}</span>
                  <span
                    className={`text-xs transition-colors duration-300 ${
                      isActive
                        ? 'text-blue-100'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  >
                    {tab.description}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute -bottom-px left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TabsNavigation;
