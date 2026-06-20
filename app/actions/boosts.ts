'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function requestBoost(petId: string, tier: string, days: number, price: number, receiptPath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to request a boost.' };

  const { data: pet } = await supabase.from('pets').select('rescuer_id').eq('id', petId).single();
  if (!pet || pet.rescuer_id !== user.id) return { error: 'You can only boost your own listings.' };

  // receipt_url stores the storage object path, not a public URL — the
  // boost-receipts bucket is private; admins view receipts via a signed URL.
  const { error } = await supabase
    .from('listing_boosts')
    .insert([{ pet_id: petId, tier, days, price, status: 'pending_verification', receipt_url: receiptPath }]);

  if (error) return { error: error.message };

  revalidatePath('/all-listings');
  return { success: true };
}
