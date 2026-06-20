'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/require-admin';
import { createAdminClient } from '@/utils/supabase/admin';

async function getAdminOrFail() {
  const adminUserId = await requireAdmin();
  if (!adminUserId) return null;
  return createAdminClient();
}

export async function updatePetStatus(petId: string, status: string) {
  const admin = await getAdminOrFail();
  if (!admin) return { error: 'Not authorized.' };

  const { error } = await admin.from('pets').update({ status }).eq('id', petId);
  if (error) return { error: error.message };

  revalidatePath('/admin/pets');
  return { success: true };
}

export async function deletePet(petId: string) {
  const admin = await getAdminOrFail();
  if (!admin) return { error: 'Not authorized.' };

  const { error } = await admin.from('pets').delete().eq('id', petId);
  if (error) return { error: error.message };

  revalidatePath('/admin/pets');
  return { success: true };
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const admin = await getAdminOrFail();
  if (!admin) return { error: 'Not authorized.' };

  const { error } = await admin.from('applications').update({ status }).eq('id', applicationId);
  if (error) return { error: error.message };

  revalidatePath('/admin/applications');
  return { success: true };
}

export async function resolveReport(reportId: string) {
  const admin = await getAdminOrFail();
  if (!admin) return { error: 'Not authorized.' };

  const { error } = await admin.from('reports').update({ status: 'resolved' }).eq('id', reportId);
  if (error) return { error: error.message };

  revalidatePath('/admin/reports');
  return { success: true };
}

export async function resolveContactMessage(messageId: string) {
  const admin = await getAdminOrFail();
  if (!admin) return { error: 'Not authorized.' };

  const { error } = await admin.from('contact_messages').update({ status: 'resolved' }).eq('id', messageId);
  if (error) return { error: error.message };

  revalidatePath('/admin/contact');
  return { success: true };
}

export async function getBoostReceiptUrl(boostId: string) {
  const admin = await getAdminOrFail();
  if (!admin) return { error: 'Not authorized.' };

  const { data: boost } = await admin.from('listing_boosts').select('receipt_url').eq('id', boostId).single();
  if (!boost?.receipt_url) return { error: 'No receipt on file.' };

  const { data, error } = await admin.storage.from('boost-receipts').createSignedUrl(boost.receipt_url, 60);
  if (error || !data) return { error: error?.message || 'Could not generate receipt link.' };

  return { url: data.signedUrl };
}

export async function reviewBoost(boostId: string, petId: string, days: number, approve: boolean) {
  const adminUserId = await requireAdmin();
  if (!adminUserId) return { error: 'Not authorized.' };
  const admin = createAdminClient();

  const { error } = await admin
    .from('listing_boosts')
    .update({ status: approve ? 'approved' : 'rejected', reviewed_by: adminUserId, reviewed_at: new Date().toISOString() })
    .eq('id', boostId);
  if (error) return { error: error.message };

  const { data: pet } = await admin.from('pets').select('name, rescuer_id').eq('id', petId).single();

  if (approve) {
    const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    await admin.from('pets').update({ featured_until: featuredUntil }).eq('id', petId);
  }

  if (pet?.rescuer_id) {
    const content = approve
      ? `Your boost request for ${pet.name} was approved — it'll be featured for ${days} days.`
      : `Your boost request for ${pet.name} was declined. Please contact us if you have questions about your payment.`;
    await admin.from('messages').insert([{ sender_id: adminUserId, recipient_id: pet.rescuer_id, pet_id: petId, content }]);
  }

  revalidatePath('/admin/boosts');
  revalidatePath('/all-listings');
  revalidatePath('/dashboard');
  return { success: true };
}
