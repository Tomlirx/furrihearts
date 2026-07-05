import type { SupabaseClient } from '@supabase/supabase-js';

// Fixed-window rate limit backed by the check_rate_limit() DB function.
// Returns true when the action is allowed, false when it should be blocked.
// Fails OPEN (allows) if the check itself errors, so a limiter outage never
// locks legitimate users out.
export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window: `${windowSeconds} seconds`,
  });
  if (error) {
    console.error('Rate limit check failed:', error.message);
    return true;
  }
  return data === true;
}
