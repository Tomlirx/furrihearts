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

export async function reviewBoost(boostId: string, petId: string, days: number, approve: boolean) {
  const admin = await getAdminOrFail();
  if (!admin) return { error: 'Not authorized.' };

  const { error } = await admin.from('listing_boosts').update({ status: approve ? 'approved' : 'rejected' }).eq('id', boostId);
  if (error) return { error: error.message };

  if (approve) {
    const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    await admin.from('pets').update({ featured_until: featuredUntil }).eq('id', petId);
  }

  revalidatePath('/admin/boosts');
  return { success: true };
}
