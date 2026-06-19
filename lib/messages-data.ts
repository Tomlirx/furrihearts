// Adopter <-> rescuer messaging helpers, following the same resilience pattern
// as lib/profile-data.ts: degrade to [] if the `messages` table doesn't exist
// yet (i.e. the migration hasn't been run), instead of throwing.

export const MAX_MESSAGE_WORDS = 200;

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function getInbox(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id (first_name, last_name), pets (id, name, image_url)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });
    return error ? [] : (data || []);
  } catch {
    return [];
  }
}

export async function getSentMessages(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, recipient:recipient_id (first_name, last_name), pets (id, name, image_url)')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });
    return error ? [] : (data || []);
  } catch {
    return [];
  }
}

export async function getThread(supabase: any, userId: string, otherId: string, petId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id (first_name, last_name)')
      .eq('pet_id', petId)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    return error ? [] : (data || []);
  } catch {
    return [];
  }
}

// Groups a flat list of inbox/sent messages into one row per (other person, pet) thread.
export function groupThreads(messages: any[], currentUserId: string) {
  const threads = new Map<string, { otherId: string; otherName: string; petId: string; petName: string; petImage: string; latest: any; count: number }>();

  for (const msg of messages) {
    const otherId = msg.sender_id === currentUserId ? msg.recipient_id : msg.sender_id;
    const key = `${otherId}-${msg.pet_id}`;
    const otherProfile = msg.sender_id === currentUserId ? msg.recipient : msg.sender;

    const existing = threads.get(key);
    if (!existing || new Date(msg.created_at) > new Date(existing.latest.created_at)) {
      threads.set(key, {
        otherId,
        otherName: otherProfile ? `${otherProfile.first_name || ''} ${otherProfile.last_name || ''}`.trim() : 'User',
        petId: msg.pet_id,
        petName: msg.pets?.name || 'a pet',
        petImage: msg.pets?.image_url,
        latest: msg,
        count: (existing?.count || 0) + 1,
      });
    } else {
      existing.count += 1;
    }
  }

  return Array.from(threads.values()).sort((a, b) => new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime());
}
