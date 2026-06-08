// app/actions/onboarding.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function completeOnboarding(formData: FormData) {
  const role = formData.get('role') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  if (!role || !firstName || !lastName) {
    return { error: 'Please fill in all fields.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Update using your exact schema columns
  const { error } = await supabase
    .from('profiles')
    .update({ 
      role: role,
      first_name: firstName,
      last_name: lastName,
      name: `${firstName} ${lastName}`.trim(),
      email: user.email // Ensure the email column is populated from the Google auth session
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'Failed to update profile.' };
  }

  redirect('/browse');
}