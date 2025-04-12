export interface Country {
  name: string;
  code: string;
  flag: string;
}

export const countries: Country[] = [
  { name: 'United States', code: 'US', flag: 'https://flagcdn.com/us.svg' },
  { name: 'Canada', code: 'CA', flag: 'https://flagcdn.com/ca.svg' },
  { name: 'United Kingdom', code: 'GB', flag: 'https://flagcdn.com/gb.svg' },
  // Add other countries as needed
];
