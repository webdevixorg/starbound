// pages/_app.tsx
import '@/styles/tailwind.css';
import '@/styles/main.scss';
import type { AppProps } from 'next/app';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ContentProvider } from '@/context/ContentContext';
import { ModalProvider } from '@/context/ModalAlertContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { VisitProvider } from '@/context/VisitContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from '@/components/Common/ScrollToTop'; // import here
import LoadingSpinner from '@/components/Common/Loading';

function Providers({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <ContentProvider>
      <ModalProvider>
        <CartProvider>
          <WishlistProvider isAuthenticated={isAuthenticated}>
            <VisitProvider>{children}</VisitProvider>
          </WishlistProvider>
        </CartProvider>
      </ModalProvider>
    </ContentProvider>
  );
}

export default function Starbound({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ScrollToTop>
        <main className="flex flex-col flex-grow">
          <Providers>
            <Component {...pageProps} />
          </Providers>
        </main>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
        />
      </ScrollToTop>
    </AuthProvider>
  );
}
