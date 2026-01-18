// utils/env.ts

/**
 * A utility module for accessing environment variables.
 * This ensures that all environment variables are accessed from a single source of truth.
 */

// API Configuration
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

// Company Information
export const NEXT_PUBLIC_COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME;
export const NEXT_PUBLIC_COMPANY_GENERAL_EMAIL =
  process.env.NEXT_PUBLIC_COMPANY_GENERAL_EMAIL;
export const NEXT_PUBLIC_WEBSITE_NAME = process.env.NEXT_PUBLIC_WEBSITE_NAME;
export const NEXT_PUBLIC_WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;
export const NEXT_PUBLIC_COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS;
export const NEXT_PUBLIC_COMPANY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE;
export const NEXT_PUBLIC_COMPANY_CAREER_EMAIL =
  process.env.NEXT_PUBLIC_COMPANY_CAREER_EMAIL;

// EmailJS Configuration
export const NEXT_PUBLIC_EMAILJS_SERVICE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
export const NEXT_PUBLIC_EMAILJS_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
export const NEXT_PUBLIC_EMAILJS_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

// Supabase Configuration
export const NEXT_PUBLIC_SUPABASE_STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BASE_URL;
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
