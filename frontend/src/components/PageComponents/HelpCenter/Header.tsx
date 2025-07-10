import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="flex justify-between items-center mb-5 bg-white p-4 rounded-lg shadow-md">
      <nav className="flex space-x-4">
        <a
          href="#"
          className={`${
            activeTab === 'All Tickets'
              ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600'
          }`}
          onClick={() => setActiveTab('All Tickets')}
        >
          All Tickets
        </a>
        <a
          href="#"
          className={`${
            activeTab === 'Started'
              ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600'
          }`}
          onClick={() => setActiveTab('Started')}
        >
          Started
        </a>
        <a
          href="#"
          className={`${
            activeTab === 'Snoozed'
              ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600'
          }`}
          onClick={() => setActiveTab('Snoozed')}
        >
          Snoozed
        </a>
        <a
          href="#"
          className={`${
            activeTab === 'Drafts'
              ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600'
          }`}
          onClick={() => setActiveTab('Drafts')}
        >
          Drafts
        </a>
        <a
          href="#"
          className={`${
            activeTab === 'Deleted'
              ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600'
          }`}
          onClick={() => setActiveTab('Deleted')}
        >
          Deleted
        </a>
      </nav>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        New Ticket
      </button>
    </header>
  );
};

export default Header;
