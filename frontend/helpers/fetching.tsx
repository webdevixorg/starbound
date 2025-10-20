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
