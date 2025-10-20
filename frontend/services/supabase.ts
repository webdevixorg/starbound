import { createClient } from '@supabase/supabase-js';

// Get environment variables imported by next.config.ts
const NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://pxrnjcxsxlridkkqehyo.supabase.co';
const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cm5qY3hzeGxyaWRra3FlaHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODEzMDcsImV4cCI6MjA2OTU1NzMwN30.4K7XA7t3siOZlfusU-kxCfYtPKaZ9lLma_VpkfakvT8';

if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL as string,
  NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);
