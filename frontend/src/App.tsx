import React from 'react';
import AppRoutes from './AppRoutes';
import { useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { ModalProvider } from './context/ModalAlertContext';
import ScrollToTop from './components/Common/ScrollToTop';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { VisitProvider } from './context/VisitContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.scss';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col">
      <ScrollToTop>
        <main className="flex-grow">
          <ContentProvider>
            <ModalProvider>
              <CartProvider>
                <WishlistProvider isAuthenticated={isAuthenticated}>
                  <VisitProvider>
                    <AppRoutes />
                  </VisitProvider>
                </WishlistProvider>
              </CartProvider>
            </ModalProvider>
          </ContentProvider>
        </main>
      </ScrollToTop>

      {/* ToastContainer is placed here, so toasts will be displayed globally */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default App;
