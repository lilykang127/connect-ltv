
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Create Supabase client with proper error handling
export const supabase = createClient(
  supabaseUrl || 'https://your-project-url.supabase.co',  // This is a fallback for development only
  supabaseAnonKey || 'your-public-anon-key-for-development-only'  // This is a fallback for development only
);
