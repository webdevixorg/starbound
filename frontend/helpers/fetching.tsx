// React and Hook imports
import { useEffect, useState } from 'react';
import { useContent } from '@/context/ContentContext'; // Custom context hook to access content types
import axiosInstance from '@/services/AxiosInstance'; // Preconfigured Axios instance
import { Category } from '@/types/types'; // Type definition for Category

// Interface for content type object
interface ContentType {
  id: any;
  model: string;
}

/**
 * Get the content type that matches the given pathname.
 * Checks if the pathname contains the model name of any content type.
 *
 * @param pathname - current route pathname
 * @param contentTypes - array of content types
 * @returns the matched ContentType or undefined
 */
export const getMatchedContentType = (
  pathname: string,
  contentTypes: ContentType[] | null
): ContentType | undefined => {
  // Check if contentTypes is an array and find one whose model appears in the pathname
  return Array.isArray(contentTypes)
    ? contentTypes.find((contentType: ContentType) =>
        pathname.includes(`/${contentType.model}`)
      )
    : undefined;
};

/**
 * Component that fetches and displays the name of a category based on its ID.
 *
 * @param categoryId - the ID of the category
 */
export const CategoryName: React.FC<{ categoryId: any }> = ({ categoryId }) => {
  const [name, setName] = useState<string>(''); // State to hold the category name

  /**
   * Fetches the category name from the backend by ID.
   * @param id - category ID
   * @returns category name as string
   */
  const getCategoryName = async (id: string): Promise<string> => {
    try {
      const response = await axiosInstance.get(`/categories/${id}/`);
      return response.data.name; // Extract the name from response
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw new Error('Failed to fetch category name. Please try again later.');
    }
  };

  // Fetch category name when component mounts or when categoryId changes
  useEffect(() => {
    const fetchName = async () => {
      const categoryName = await getCategoryName(categoryId);
      setName(categoryName); // Update state with fetched name
    };

    fetchName();
  }, [categoryId]);

  return <>{name}</>; // Display the category name
};

/**
 * Recursively searches for a category or its child by slug.
 *
 * @param categories - list of top-level categories
 * @param slug - the slug to match
 * @returns the matched Category or null
 */
export function findCategoryBySlug(
  categories: Category[],
  slug: string
): Category | null {
  for (const category of categories) {
    // Match top-level category
    if (category.slug === slug) return category;

    // Search in child categories
    if (category.children) {
      const foundChild = category.children.find((child) => child.slug === slug);
      if (foundChild) return foundChild;
    }
  }

  return null; // Not found
}
