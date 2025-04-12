import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { fetchContentTypes } from '../services/api'; // Adjust the import path as needed
import { ContentContextTypes, ContentTypes } from '../types/types'; // Adjust the import path as needed

// Create the context with a default value
const ContentContext = createContext<ContentContextTypes | null>(null);

// Custom hook to use the ContentContext
export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

// Provider component
export const ContentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [contentTypes, setContentTypes] = useState<ContentTypes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contentTypeData = await fetchContentTypes();
        setContentTypes(contentTypeData);
      } catch (error) {
        console.error('Failed to fetch content data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ContentContext.Provider value={{ contentTypes, loading }}>
      {children}
    </ContentContext.Provider>
  );
};
