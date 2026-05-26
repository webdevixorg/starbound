import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables imported by next.config.ts
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client lazily and avoid throwing during build-time prerender.
// Some Next.js prerender steps run in environments where env files may not be loaded.
let supabase: SupabaseClient | null = null;
if (NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} else {
  // Avoid throwing here — callers should handle a null `supabase` during prerender.
  // Log a warning to make the issue visible in build logs.
  // eslint-disable-next-line no-console
  console.warn('Supabase env not found; supabase client not created.');
}

export { supabase };
