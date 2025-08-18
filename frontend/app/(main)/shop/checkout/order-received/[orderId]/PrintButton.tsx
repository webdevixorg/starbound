'use client';

import React from 'react';

const PrintButton: React.FC = () => {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors print:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      🖨️ Print Order
    </button>
  );
};

export default PrintButton;
