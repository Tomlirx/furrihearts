import { createClient } from '@/utils/supabase/server';

// Verifies the current session belongs to an auditor, using the normal
// cookie-based (RLS-respecting) client — never the service-role client.
// Auditor is a strictly separate role from Admin (no is_admin fallback).
// Returns the user id if they're an auditor, or null otherwise.
export async function requireAuditor(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('is_auditor').eq('id', user.id).single();
  return profile?.is_auditor ? user.id : null;
}
