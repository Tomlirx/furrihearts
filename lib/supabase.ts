// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// We are leaving the options object empty. 
// @supabase/ssr will automatically handle document.cookie safely, 
// toggling the 'secure' flag off for localhost and on for Vercel.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);