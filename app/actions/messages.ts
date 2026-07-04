'use server';

import { createClient } from '@/utils/supabase/server';
import { countWords, MAX_MESSAGE_WORDS, TERMINAL_APPLICATION_STATUSES } from '@/lib/messages-data';

const CONVERSATION_CLOSED_ERROR = 'This conversation is closed — the application is no longer active.';

// Messaging is blocked once the application lifecycle has ended. Both checks
// run: the specific application referenced by the composer, and the latest
// application between the two participants for this pet (so a stale or forged
// applicationId cannot reopen a closed conversation). A cancelled application
// followed by a fresh pending one keeps the conversation open.
async function isMessagingBlocked(
  supabase: Awaited<ReturnType<typeof createClient>>,
  { applicationId, petId, senderId, recipientId }: { applicationId: string | null; petId: string | null; senderId: string; recipientId: string },
) {
  if (applicationId) {
    const { data: app } = await supabase
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .maybeSingle();
    if (app?.status && TERMINAL_APPLICATION_STATUSES.includes(app.status)) return true;
  }

  if (petId) {
    const { data: latest } = await supabase
      .from('applications')
      .select('status')
      .eq('pet_id', petId)
      .in('applicant_id', [senderId, recipientId])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.status && TERMINAL_APPLICATION_STATUSES.includes(latest.status)) return true;
  }

  return false;
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to send a message.' };

  const recipientId = formData.get('recipientId') as string;
  const petId = formData.get('petId') as string;
  const applicationId = (formData.get('applicationId') as string) || null;
  const content = (formData.get('content') as string || '').trim();

  if (!recipientId || !content) {
    return { error: 'A message and recipient are required.' };
  }
  if (recipientId === user.id) {
    return { error: 'You cannot message yourself.' };
  }
  if (countWords(content) > MAX_MESSAGE_WORDS) {
    return { error: `Messages are limited to ${MAX_MESSAGE_WORDS} words.` };
  }

  if (await isMessagingBlocked(supabase, { applicationId, petId: petId || null, senderId: user.id, recipientId })) {
    return { error: CONVERSATION_CLOSED_ERROR };
  }

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    recipient_id: recipientId,
    pet_id: petId || null,
    application_id: applicationId,
    content,
  });

  if (error) {
    console.error('Send message error:', error);
    return { error: 'Could not send your message. Please try again.' };
  }

  return { success: true };
}
