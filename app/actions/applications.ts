'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

// Rescuer approves or declines a pending application for one of their pets.
// Server-side identity + ownership + state check; the DB trigger
// enforce_application_transition is the ultimate guard.
export async function reviewApplication(applicationId: string, decision: 'approved' | 'rejected') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to manage applications.' };

  const { data: application } = await supabase
    .from('applications')
    .select('id, status, pet_id, applicant_id, pets:pet_id (rescuer_id, name)')
    .eq('id', applicationId)
    .single();

  if (!application) return { error: 'Application not found.' };
  if ((application.pets as any)?.rescuer_id !== user.id) {
    return { error: 'You can only review applications for your own listings.' };
  }
  if (application.status !== 'pending') {
    return { error: 'Only a pending application can be reviewed.' };
  }

  // On approval the DB trigger auto-rejects competing pending applications —
  // capture those applicants first so they can be notified too.
  let competingApplicants: string[] = [];
  if (decision === 'approved' && application.pet_id) {
    const { data: others } = await supabase
      .from('applications')
      .select('applicant_id')
      .eq('pet_id', application.pet_id)
      .eq('status', 'pending')
      .neq('id', applicationId);
    competingApplicants = (others || []).map((o: { applicant_id: string | null }) => o.applicant_id).filter(Boolean) as string[];
  }

  const { error } = await supabase.from('applications').update({ status: decision }).eq('id', applicationId);
  if (error) return { error: error.message };

  // Notify the applicant in their inbox (rings the navbar bell). Sent as a
  // regular message from the rescuer — on approval the adopter can reply in
  // the same thread to arrange the meet-up. Best-effort: a notification
  // failure must not undo the review.
  if (application.applicant_id) {
    const petName = (application.pets as any)?.name || 'your application';
    const content = decision === 'approved'
      ? `Great news — your application for ${petName} has been approved! 🎉 Reply here to arrange a meet-up.`
      : `Thank you for your interest in ${petName}. Unfortunately this application wasn't successful this time — you're welcome to apply for other pets.`;
    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: application.applicant_id,
      pet_id: application.pet_id,
      application_id: application.id,
      content,
    });
  }

  // Applicants auto-rejected by the approval cascade get a one-way notice.
  if (competingApplicants.length > 0) {
    const petName = (application.pets as any)?.name || 'this pet';
    await supabase.from('messages').insert(
      competingApplicants.map((applicantId) => ({
        sender_id: user.id,
        recipient_id: applicantId,
        pet_id: application.pet_id,
        content: `Thank you for your interest in ${petName}. Another application was approved, so this listing is no longer available — you're welcome to browse other pets looking for a home.`,
        is_system: true,
      })),
    );
  }

  revalidatePath('/manage-applications');
  revalidatePath('/dashboard');
  return { success: true };
}

// Applicant withdraws their own still-pending application.
export async function withdrawApplication(applicationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to manage applications.' };

  const { data: application } = await supabase
    .from('applications')
    .select('id, status, applicant_id')
    .eq('id', applicationId)
    .single();

  if (!application) return { error: 'Application not found.' };
  if (application.applicant_id !== user.id) {
    return { error: 'You can only withdraw your own application.' };
  }
  if (application.status !== 'pending') {
    return { error: 'Only a pending application can be withdrawn.' };
  }

  const { error } = await supabase.from('applications').update({ status: 'cancelled' }).eq('id', applicationId);
  if (error) return { error: error.message };

  revalidatePath('/my-applications');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function closeApplication(applicationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to manage applications.' };

  const { data: application } = await supabase
    .from('applications')
    .select('id, status, pet_id, applicant_id, pets:pet_id (rescuer_id, name)')
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

  // Congratulate the adopter (one-way notice; the conversation is closed now).
  if (application.applicant_id) {
    const petName = (application.pets as any)?.name || 'your new family member';
    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: application.applicant_id,
      pet_id: application.pet_id,
      application_id: application.id,
      content: `🎉 The adoption is complete — ${petName} is officially part of your family. Thank you for adopting!`,
      is_system: true,
    });
  }

  revalidatePath('/manage-applications');
  revalidatePath('/all-listings');
  revalidatePath('/dashboard');
  return { success: true };
}
