'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function closeApplication(applicationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to manage applications.' };

  const { data: application } = await supabase
    .from('applications')
    .select('id, status, pet_id, pets:pet_id (rescuer_id)')
    .eq('id', applicationId)
    .single();

  if (!application) return { error: 'Application not found.' };
  const rescuerId = (application.pets as any)?.rescuer_id;
  if (rescuerId !== user.id) return { error: 'You can only close applications for your own listings.' };
  if (application.status !== 'approved') return { error: 'Only an approved application can be closed.' };

  const { error: closeError } = await supabase.from('applications').update({ status: 'closed' }).eq('id', applicationId);
  if (closeError) return { error: closeError.message };

  const { error: petError } = await supabase.from('pets').update({ status: 'adopted' }).eq('id', application.pet_id);
  if (petError) return { error: petError.message };

  await supabase.from('applications').update({ status: 'rejected' }).eq('pet_id', application.pet_id).eq('status', 'pending');

  revalidatePath('/manage-applications');
  revalidatePath('/all-listings');
  revalidatePath('/dashboard');
  return { success: true };
}
