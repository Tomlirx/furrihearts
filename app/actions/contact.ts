'use server';

import { createClient } from '@/utils/supabase/server';

export async function submitContactMessage(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const category = formData.get('category') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { error: 'Please fill in your name, email, and message.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('contact_messages').insert({ name, email, category, message });

  if (error) {
    console.error('Contact message error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}
