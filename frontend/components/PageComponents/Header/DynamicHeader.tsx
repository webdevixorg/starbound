'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Header = dynamic(() => import('./Header'), {
  ssr: false,
});

interface DynamicHeaderProps {
  layout: 'default' | 'dashboard' | 'full-width';
}

export default function DynamicHeader({ layout }: DynamicHeaderProps) {
  return (
    <Suspense fallback={<div className="h-20 bg-white shadow-sm"></div>}>
      <Header layout={layout} />
    </Suspense>
  );
}
