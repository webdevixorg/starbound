'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import HeaderSkeleton from './HeaderSkeleton';
import { siteConfig } from '@/config/site';

const Header = dynamic(() => import('./Header'));

interface DynamicHeaderProps {
  layout: 'default' | 'dashboard' | 'full-width';
}

export default function DynamicHeader({ layout }: DynamicHeaderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, siteConfig.skeletonMinTime);

    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return <HeaderSkeleton />;
  }

  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <Header layout={layout} />
    </Suspense>
  );
}
