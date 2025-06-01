import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import Footer from '../components/PageComponents/Footer';
import Header from '../components/PageComponents/Header/Header';
import LoadingSpinner from '../components/Common/Loading';

const MainLayout: React.FC = () => {
  const [loading] = useState<boolean>(false);
  const location = useLocation();
  const noHeaderFooterPaths = ['/signin', '/signup'];
  const showHeaderFooter = !noHeaderFooterPaths.includes(location.pathname);

  // Handle loading state before rendering content
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {showHeaderFooter && <Header layout="main" />}
      <Outlet />
      {showHeaderFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
