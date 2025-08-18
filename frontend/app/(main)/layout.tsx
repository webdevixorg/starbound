import { ReactNode } from 'react';
import Header from '@/components/PageComponents/Header/Header';
import Footer from '@/components/PageComponents/Footer';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header layout="default" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
      <Footer />
    </>
  );
}
