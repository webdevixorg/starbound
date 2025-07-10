import React, { useState } from 'react';

import Sidebar from '../components/PageComponents/HelpCenter/Sidebar';
import Tickets from '../components/PageComponents/HelpCenter/Tickets';
import Header from '../components/PageComponents/HelpCenter/Header';

const HelpCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Tickets');

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-5 max-w-[600px]">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <Tickets activeTab={activeTab} />
      </div>
    </div>
  );
};

export default HelpCenter;
