// formSubmission.ts

import { useEffect } from 'react';
import { Category } from '../types/types';

export const toggleCategorySelection = (
  selectedCategories: Category[],
  category: Category
): Category[] => {
  return selectedCategories.find((cat) => cat.id === category.id)
    ? selectedCategories.filter((cat) => cat.id !== category.id)
    : [...selectedCategories, category];
};

export const useEventListener = (
  eventType: string,
  handler: (event: Event) => void,
  condition: boolean
) => {
  useEffect(() => {
    if (condition) {
      document.addEventListener(eventType, handler);
    } else {
      document.removeEventListener(eventType, handler);
    }
    return () => {
      document.removeEventListener(eventType, handler);
    };
  }, [eventType, handler, condition]);
};

export const createHandleDateChange = (setDate: (value: string) => void) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate the date-time format if necessary
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      setDate(value);
    }
  };
};
