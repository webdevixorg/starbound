// src/pages/Posts.tsx

import React from 'react';
import PostPageGrid from '../components/PageComponents/PostPageGrid';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';

const Posts: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto px-4 mt-6">
        <BreadcrumbsComponent />
      </div>
      <PostPageGrid filter="latest" />
    </div>
  );
};

export default Posts;
