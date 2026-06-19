import { createClient } from '@/utils/supabase/server';

// Verifies the current session belongs to an admin, using the normal
// cookie-based (RLS-respecting) client — never the service-role client.
// Returns the user id if they're an admin, or null otherwise.
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user.id : null;
}
