import { createClient } from '@supabase/supabase-js';

// Load .env file in local development if env vars are missing
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  // Only load dotenv in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    // Dynamically import dotenv to avoid issues in production
    require('dotenv').config();
  }
}

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Ensure they are set in your environment or .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL as string,
  NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);
