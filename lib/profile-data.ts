// Small resilience helpers shared by /profile, /dashboard, /my-applications,
// /manage-applications and /all-listings. New tables/columns referenced here
// (saved_pets, rescuer_follows) may not exist yet until the migration in
// supabase/migrations/0001_profile_design_parity.sql is run, so every call
// degrades to an empty/zero result instead of throwing.

export async function getMyPets(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('rescuer_id', userId)
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function getMyApplications(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, pets (id, name, image_url, species, gender, location, rescuer_id)')
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function getIncomingApplications(supabase: any, petIds: string[]) {
  if (!petIds.length) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('*, pets (id, name, image_url, rescuer_id), profiles:applicant_id (first_name, last_name)')
    .in('pet_id', petIds)
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function getSavedPetIdsForUser(supabase: any, userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('saved_pets').select('pet_id').eq('user_id', userId);
    if (error || !data) return [];
    return data.map((row: { pet_id: string }) => row.pet_id);
  } catch {
    return [];
  }
}

export async function getFollowedRescuerIds(supabase: any, userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('rescuer_follows').select('rescuer_id').eq('follower_id', userId);
    if (error || !data) return [];
    return data.map((row: { rescuer_id: string }) => row.rescuer_id);
  } catch {
    return [];
  }
}
