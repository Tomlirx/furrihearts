'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  const location = formData.get('location') as string;
  const bio = formData.get('bio') as string;
  const showEmail = formData.get('showEmail') === 'on';
  const showPhone = formData.get('showPhone') === 'on';
  const showWhatsapp = formData.get('showWhatsapp') === 'on';

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      name: `${firstName} ${lastName}`.trim(),
      phone,
      location,
      bio,
      show_email: showEmail,
      show_phone: showPhone,
      show_whatsapp: showWhatsapp,
    })
    .eq('id', user!.id);

  if (error) {
    console.error('Profile update error:', error);
    return { error: 'Could not save your profile. Please try again.' };
  }

  redirect('/profile');
}
