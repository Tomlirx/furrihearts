'use server';

import { createClient } from '@/utils/supabase/server';
import { countWords, MAX_MESSAGE_WORDS } from '@/lib/messages-data';

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
