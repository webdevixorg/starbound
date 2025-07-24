'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ModalProvider } from '@/context/ModalAlertContext';
import { ContentProvider } from '@/context/ContentContext';

interface ProvidersProps {
  children: React.ReactNode;
}

// Inner component that has access to auth context
function InnerProviders({ children }: ProvidersProps) {
  const { isAuthenticated } = useAuth();

  return (
    <ModalProvider>
      <ContentProvider>
        <CartProvider>
          <WishlistProvider isAuthenticated={isAuthenticated}>
            {children}
          </WishlistProvider>
        </CartProvider>
      </ContentProvider>
    </ModalProvider>
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <InnerProviders>{children}</InnerProviders>
    </AuthProvider>
  );
}
