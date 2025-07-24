// formSubmission.ts

import { useEffect, useRef } from 'react';
import { Category } from '@/types/types';

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
  const handlerRef = useRef(handler);

  // Update the ref whenever handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventHandler = (event: Event) => handlerRef.current(event);

    if (condition) {
      document.addEventListener(eventType, eventHandler);
    }

    return () => {
      document.removeEventListener(eventType, eventHandler);
    };
  }, [eventType, condition]);
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
