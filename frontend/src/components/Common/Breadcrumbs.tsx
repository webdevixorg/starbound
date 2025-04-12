import { slugify } from '../../helpers/common';
import { Post, Product } from '../../types/types';
import { useLocation } from 'react-router-dom';

type BreadcrumbsProps = {
  product?: Product | null;
  post?: Post | null;
  optional?: string;
};

const BreadcrumbsComponent = ({
  product,
  post,
  optional,
}: BreadcrumbsProps) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const pageName =
    pathSegments[0]?.charAt(0).toUpperCase() + pathSegments[0]?.slice(1) ||
    'Home';
  const baseHref = `/${pathSegments[0]}`;

  // Helper function to render the category breadcrumb
  const renderCategory = () => {
    const categories = product?.categories || post?.categories;
    if (categories) {
      const categoryNames = Array.isArray(categories)
        ? categories.map((category) => category.name).join(', ')
        : categories;

      const categorySlug = Array.isArray(categories)
        ? categories
            .map((category) => category.slug.trim().replace(/\s+/g, ''))
            .join('_') // Remove spaces and replace hyphens with underscores
        : categories; // Remove spaces and replace hyphens if it's a single category

      return (
        <li>
          <a
            href={`${baseHref}/categories/${categorySlug}`}
            className="underline"
          >
            {categoryNames}
          </a>
        </li>
      );
    }
    return null;
  };

  // Helper function to render the product/post title
  const renderTitle = () => {
    if (product) {
      return product.title || 'Loading...';
    } else if (post) {
      return post.title || 'Loading...';
    }
    return 'Loading...';
  };

  return (
    <nav aria-label="breadcrumb" className="text-sm">
      <ol className="inline-flex space-x-2">
        <li>
          <a href="/" className="underline">
            Home
          </a>
        </li>
        <li>
          <span className="text-gray-500">/</span>
        </li>
        <li>
          <a href={baseHref} className="underline">
            {pageName}
          </a>
        </li>

        {(product || post) && (
          <>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            {renderCategory()}
            {renderCategory() && (
              <li>
                <span className="text-gray-500">/</span>
              </li>
            )}
            <li>
              <span className="text-gray-700">{renderTitle()}</span>
            </li>
          </>
        )}

        {optional && (
          <>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li>
              <a href={optional} className="underline">
                {optional}
              </a>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default BreadcrumbsComponent;
