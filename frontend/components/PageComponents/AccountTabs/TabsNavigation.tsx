import React from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsNavigation: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'basic-info', label: 'Change Password' },
    { id: 'account-security', label: 'Account Security' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'payment-methods', label: 'Payment Methods' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="tabs mb-4">
      <ul className="flex border-b">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={`mr-1 ${activeTab === tab.id ? 'border-blue-500' : ''}`}
          >
            <button
              className={`bg-white inline-block py-2 px-4 ${
                activeTab === tab.id
                  ? 'text-blue-500 font-semibold'
                  : 'text-blue-500 hover:text-blue-800 font-semibold'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabsNavigation;
