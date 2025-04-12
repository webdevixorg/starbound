import { useEffect, useState } from 'react';
import { useContent } from '../context/ContentContext'; // Import the context hook
import axiosInstance from '../services/AxiosInstance';

interface ContentType {
  id: any;
  model: string;
}

export const getMatchedContentType = async (
  pathname: string
): Promise<ContentType | undefined> => {
  const contentTypes = useContent();
  return Array.isArray(contentTypes)
    ? contentTypes.find((contentType: ContentType) =>
        pathname.includes(`/${contentType.model}`)
      )
    : undefined;
};

export const CategoryName: React.FC<{ categoryId: any }> = ({ categoryId }) => {
  const [name, setName] = useState<string>('');

  const getCategoryName = async (id: string): Promise<string> => {
    try {
      const response = await axiosInstance.get(`/categories/${id}/`);
      return response.data.name;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw new Error('Failed to fetch category name. Please try again later.');
    }
  };
  useEffect(() => {
    const fetchName = async () => {
      const categoryName = await getCategoryName(categoryId);
      setName(categoryName);
    };

    fetchName();
  }, [categoryId]);

  return <>{name}</>;
};
