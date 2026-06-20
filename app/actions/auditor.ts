'use server';

import { revalidatePath } from 'next/cache';
import { requireAuditor } from '@/lib/require-auditor';
import { createAdminClient } from '@/utils/supabase/admin';

async function getAuditorOrFail() {
  const auditorUserId = await requireAuditor();
  if (!auditorUserId) return null;
  return { auditor: createAdminClient(), auditorUserId };
}

function revalidatePublicPaths() {
  revalidatePath('/auditor');
  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/all-listings');
  revalidatePath('/dashboard');
}

export async function reviewListing(petId: string, decision: 'approved' | 'rejected') {
  const ctx = await getAuditorOrFail();
  if (!ctx) return { error: 'Not authorized.' };
  const { auditor, auditorUserId } = ctx;

  const { data: pet } = await auditor.from('pets').select('name, rescuer_id').eq('id', petId).single();

  const { error } = await auditor.from('pets').update({ review_status: decision }).eq('id', petId);
  if (error) return { error: error.message };

  if (pet?.rescuer_id) {
    const content = decision === 'approved'
      ? `Your listing for ${pet.name} was approved and is now live!`
      : `Your listing for ${pet.name} was not approved and won't be shown to adopters. You're welcome to create a new listing.`;
    await auditor.from('messages').insert([{ sender_id: auditorUserId, recipient_id: pet.rescuer_id, pet_id: petId, content }]);
  }

  revalidatePublicPaths();
  return { success: true };
}

export async function setListingFeatured(petId: string, featured: boolean) {
  const ctx = await getAuditorOrFail();
  if (!ctx) return { error: 'Not authorized.' };
  const { auditor } = ctx;

  const { error } = await auditor.from('pets').update({ is_featured: featured }).eq('id', petId);
  if (error) return { error: error.message };

  revalidatePublicPaths();
  return { success: true };
}
