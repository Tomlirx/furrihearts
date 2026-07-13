import { createClient } from '@supabase/supabase-js';

// Dedicated client for the password-RECOVERY flow only (forgot / reset pages).
//
// Why a separate raw client instead of the app's @supabase/ssr browser client:
// createBrowserClient hardcodes flowType: 'pkce', which puts a code_verifier in
// the *requesting* browser's storage. Password-reset emails are very often
// opened on a different device/browser (no verifier there) → the exchange
// fails and the link looks "expired". This client uses the IMPLICIT flow:
// tokens arrive in the URL hash (#access_token) and need no verifier, so the
// reset link works cross-device.
//
// persistSession:false keeps the recovery session in memory only — it never
// touches the app's cookie session, and after the password is updated we send
// the user to /login to sign in fresh with the new password.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const recoveryClient = url && key
  ? createClient(url, key, {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: false,
        autoRefreshToken: false,
        storageKey: 'fh-recovery',
      },
    })
  : null;
