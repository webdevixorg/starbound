import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import Footer from '../components/PageComponents/Footer';
import Header from '../components/PageComponents/Header/Header'; // Import the Header component

const MainLayout: React.FC = () => {
  const [loading] = useState<boolean>(false);
  const location = useLocation();
  const noHeaderFooterPaths = ['/signin', '/signup']; // Add paths where you don't want header and footer
  const showHeaderFooter = !noHeaderFooterPaths.includes(location.pathname);

  return (
    <div>
      {showHeaderFooter && <Header layout="main" />}
      {loading ? <div>Loading...</div> : <Outlet />}
      {showHeaderFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
