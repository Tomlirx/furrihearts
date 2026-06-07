// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      // Reads cookies directly from the browser document
      return document.cookie.split(';').map(c => {
        const [name, value] = c.split('=').map(v => v.trim());
        return { name, value: decodeURIComponent(value || '') };
      });
    },
    setAll(cookiesToSet) {
      // Forces the browser to write to cookies instead of Local Storage
      cookiesToSet.forEach(({ name, value, options }) => {
        document.cookie = `${name}=${value}; path=/; secure; sameSite=lax`;
      });
    },
    remove(name) {
      // Ensures logging out correctly clears the cookie
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  },
});