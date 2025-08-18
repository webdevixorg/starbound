// src/pages/Posts.tsx

import React from 'react';
import PostPageGrid from '@/components/PageComponents/PostPageGrid';
import BreadcrumbsComponent from '@/components/Common/Breadcrumbs';

const Posts: React.FC = () => {
  return (
    <div className="container mx-auto">
      <div className="mx-auto mt-6">
        <BreadcrumbsComponent />
      </div>
      <PostPageGrid filter={'latest'} count={10000000} />
    </div>
  );
};

export default Posts;
