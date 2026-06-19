import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// SERVER-ONLY. This client uses the service_role key and bypasses Row Level
// Security entirely. Never import this file from a client component, and
// never expose its result to the browser. Only use it inside app/admin
// server code and app/actions/admin.ts, and only after independently
// verifying the caller is an admin via the normal cookie-based client.

export function isAdminConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to your environment variables.');
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
