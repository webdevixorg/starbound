import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar p-4">
      <div className="search-section">
        <div className="search-label">
          <h3>Search for a question</h3>
          <p>Type your question or search keyword</p>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Start typing..." />
        </div>
      </div>
      <div className="categories">
        <div className="category active">Getting started</div>
        <div className="category">Account with Card</div>
        <div className="category">Withdraw to Bank</div>
        <div className="category">Bank Accounts</div>
        <div className="category">How Do I Reset My Password?</div>
        <div className="category">How to get paid with Payoneer</div>
      </div>
      <div className="contact-us">
        <p>Do you still need our help?</p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Contact Us
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
