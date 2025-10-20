import { ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Footer from '@/components/PageComponents/Footer';

const Header = dynamic(
  () => import('@/components/PageComponents/Header/Header'),
  {
    ssr: false,
  }
);

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-20 bg-white shadow-sm"></div>}>
        <Header layout="default" />
      </Suspense>
      <main className="container mx-auto">{children}</main>
      <Footer />
    </>
  );
}
