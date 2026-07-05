'use server';

import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function submitContactMessage(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const category = formData.get('category') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { error: 'Please fill in your name, email, and message.' };
  }

  const supabase = await createClient();

  // Rate limit anonymous submissions: 5 per 10 minutes per IP.
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!(await checkRateLimit(supabase, `contact:${ip}`, 5, 600))) {
    return { error: "You've sent several messages recently. Please try again in a little while." };
  }

  const { error } = await supabase.from('contact_messages').insert({ name, email, category, message });

  if (error) {
    console.error('Contact message error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}
