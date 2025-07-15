import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/Common/Loading';
import Sidebar from '../components/PageComponents/HelpCenter/Sidebar';
import Tickets from '../components/PageComponents/HelpCenter/Tickets';
import Header from '../components/PageComponents/HelpCenter/Header';

const HelpCenter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState('All Tickets');

  useEffect(() => {
    // Simulate loading delay or wrap in async fetch logic
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // e.g., simulate a 500ms load time

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

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
