import { ReactNode } from 'react';
import Footer from '@/components/PageComponents/Footer';
import DynamicHeader from '@/components/PageComponents/Header/DynamicHeader';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DynamicHeader layout="default" />
      <main className="mx-auto">{children}</main>
      <Footer />
    </>
  );
}
