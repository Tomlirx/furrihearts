'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function setListingVisibility(petId: string, hidden: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to manage your listings.' };

  const { data: pet } = await supabase.from('pets').select('rescuer_id').eq('id', petId).single();
  if (!pet || pet.rescuer_id !== user.id) return { error: 'You can only manage your own listings.' };

  const { error } = await supabase.from('pets').update({ is_hidden: hidden }).eq('id', petId);
  if (error) return { error: error.message };

  revalidatePath('/all-listings');
  revalidatePath('/dashboard');
  return { success: true };
}
