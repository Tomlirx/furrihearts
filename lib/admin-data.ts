// Admin read helpers — all take the service-role client (utils/supabase/admin.ts)
// and follow the same resilience pattern as lib/profile-data.ts: degrade to
// []/null on error rather than throwing, so pages don't break if a table or
// column referenced here hasn't been migrated yet.

export async function getAdminOverview(admin: any) {
  const [{ count: userCount }, { count: petCount }, { count: appCount }, { count: openReports }, { count: openContacts }, { count: pendingBoosts }] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('pets').select('id', { count: 'exact', head: true }),
    admin.from('applications').select('id', { count: 'exact', head: true }),
    admin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('listing_boosts').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
  ]);

  return {
    userCount: userCount || 0,
    petCount: petCount || 0,
    appCount: appCount || 0,
    openReports: openReports || 0,
    openContacts: openContacts || 0,
    pendingBoosts: pendingBoosts || 0,
  };
}

export async function getAllUsers(admin: any, search?: string) {
  let query = admin.from('profiles').select('*').order('updated_at', { ascending: false });
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  const { data, error } = await query;
  return error ? [] : (data || []);
}

export async function getUserDetail(admin: any, userId: string) {
  const [{ data: profile }, { data: pets, error: petsError }, { data: apps, error: appsError }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', userId).single(),
    admin.from('pets').select('*').eq('rescuer_id', userId).order('created_at', { ascending: false }),
    admin.from('applications').select('*, pets (id, name, image_url)').eq('applicant_id', userId).order('created_at', { ascending: false }),
  ]);
  return {
    profile: profile || null,
    pets: petsError ? [] : (pets || []),
    applications: appsError ? [] : (apps || []),
  };
}

export async function getAllPets(admin: any) {
  const { data, error } = await admin.from('pets').select('*, profiles:rescuer_id (first_name, last_name)').order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function getAllApplications(admin: any) {
  const { data, error } = await admin
    .from('applications')
    .select('*, pets (id, name, image_url), profiles:applicant_id (first_name, last_name)')
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function getReports(admin: any) {
  const { data, error } = await admin
    .from('reports')
    .select('*, profiles:reporter_id (first_name, last_name)')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function getContactMessages(admin: any) {
  const { data, error } = await admin.from('contact_messages').select('*').order('status', { ascending: true }).order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function getPendingBoosts(admin: any) {
  const { data, error } = await admin
    .from('listing_boosts')
    .select('*, pets (id, name, image_url, rescuer_id)')
    .order('created_at', { ascending: false });
  return error ? [] : (data || []);
}
