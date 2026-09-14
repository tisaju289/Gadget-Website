import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase connection is configuration, not code.
// Set these in .env (local) or as build variables (Cloudflare Workers / CI):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY   (anon / publishable key)
//   VITE_SUPABASE_PROJECT_ID        (optional, informational)
const env = import.meta.env as Record<string, string | undefined>;

const SUPABASE_URL =
  env.VITE_SUPABASE_URL ||
  "https://igekkbfklkuthteiogfs.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZWtrYmZrbGt1dGh0ZWlvZ2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Njg1NTAsImV4cCI6MjA5NTM0NDU1MH0.eevwZFtJq2eMkv8-RmOqbz-73x3SCVb8XkQyruYZ5-U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
