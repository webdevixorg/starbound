/**
 * Format a number as currency with thousand separators.
 * @param amount The number to format.
 * @param currencySymbol The currency symbol (e.g., 'රු', '$').
 * @param locale The locale code (e.g., 'en-US', 'de-DE').
 */
export const formatCurrency = (
  amount: number,
  currencySymbol: string = 'රු',
  locale: string = 'en-US'
) => {
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'decimal',
  }).format(amount);
  return `${currencySymbol} ${formattedAmount}`;
};

/**
 * Format a date string into a more readable format.
 * @param dateStr The date string to format.
 */
export const formatDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

/**
 * Converts a given date to an ISO 8601 string format.
 * If no date is provided, returns the current date and time in ISO 8601 format.
 * @param date - The date to format, either as a string or a Date object. Optional.
 * @returns The formatted date string in ISO 8601 format.
 */
export const formatDateToISOString = (date?: string | Date): string => {
  return date ? new Date(date).toISOString() : new Date().toISOString();
};

// helpers/dateUtils.ts
export const timeSince = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + ' years ago';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + ' months ago';
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + ' days ago';
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + ' hours ago';
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
};

/**
 * Validate an email address.
 * @param email The email address to validate.
 */
export const validateEmail = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

/**
 * Capitalize the first letter of a string.
 * @param str The string to capitalize.
 */
export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// utils/slugify.ts// common.ts
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};
