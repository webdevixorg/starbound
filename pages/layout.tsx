import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
// import { Outlet } from 'react-router-dom';

import Footer from '@/components/PageComponents/Footer';
import Header from '@/components/PageComponents/Header/Header';
import LoadingSpinner from '@/components/Common/Loading';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading] = useState<boolean>(false);
  const pathname = usePathname();
  const noHeaderFooterPaths = ['/signin', '/signup'];
  const showHeaderFooter = !noHeaderFooterPaths.includes(pathname);

  // Handle loading state before rendering content
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {showHeaderFooter && <Header layout="main" />}
      {children}
      {showHeaderFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
