// src/pages/Posts.tsx

import React, { Suspense } from 'react';
import PostPageGrid from '@/components/PageComponents/PostPageGrid';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';

const Posts: React.FC = () => {
  return (
    <div className="container mx-auto">
      <div className="mx-auto mt-6">
        <BreadcrumbsComponent />
      </div>
      <Suspense fallback={<div>Loading posts...</div>}>
        <PostPageGrid filter={'latest'} count={10000000} />
      </Suspense>
    </div>
  );
};

export default Posts;
