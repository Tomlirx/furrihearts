import seedPets from '@/data/pets.json';

export type PetStatus = 'available' | 'adopted' | string;

export interface Pet {
  id: string;
  name: string;
  species: 'cat' | 'dog' | string;
  breed: string;
  gender: string;
  age: string;
  location: string;
  status: PetStatus;
  image_url: string;
  gallery?: string[];
  fee?: number;
  traits?: string[];
  description?: string;
  rescuer_name?: string;
  rescuer_id?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
  is_vaccinated?: boolean;
  is_dewormed?: boolean;
  is_neutered?: boolean;
  is_flea_treated?: boolean;
  is_potty_trained?: boolean;
  featured_until?: string | null;
}

export interface PetFilters {
  search?: string;
  type?: string;
  gender?: string;
  location?: string;
  status?: string[];
}

export const localPets = seedPets as Pet[];

export function getLocalPets(extraPets: Pet[] = []) {
  const merged = [...extraPets, ...localPets];
  const seen = new Set<string>();
  return merged.filter((pet) => {
    if (seen.has(pet.id)) return false;
    seen.add(pet.id);
    return true;
  });
}

export function findLocalPetById(id: string, extraPets: Pet[] = []) {
  return getLocalPets(extraPets).find((pet) => String(pet.id) === String(id)) || null;
}

export function filterLocalPets(pets: Pet[], filters: PetFilters = {}) {
  const query = filters.search?.trim().toLowerCase() || '';
  const type = filters.type || 'all';
  const gender = filters.gender || 'Any';
  const location = filters.location || 'All Malaysia';
  const statuses = filters.status || ['available', 'adopted'];

  return pets.filter((pet) => {
    const text = [pet.name, pet.breed, pet.gender, pet.location, pet.species, ...(pet.traits || [])]
      .join(' ')
      .toLowerCase();

    if (!statuses.includes(pet.status)) return false;
    if (query && !text.includes(query)) return false;
    if (type !== 'all' && pet.species.toLowerCase() !== type.toLowerCase()) return false;
    if (gender !== 'Any' && pet.gender.toLowerCase() !== gender.toLowerCase()) return false;
    if (location !== 'All Malaysia' && pet.location.toLowerCase() !== location.toLowerCase()) return false;
    return true;
  });
}

export async function fetchPets(supabase?: any, filters: PetFilters | string = {}) {
  const normalizedFilters: PetFilters = typeof filters === 'string' ? { search: filters } : filters;

  if (supabase?.from && !supabase.__isMock) {
    try {
      let query = supabase.from('pets').select('*').in('status', normalizedFilters.status || ['available', 'adopted']);

      if (normalizedFilters.type && normalizedFilters.type !== 'all') {
        query = query.ilike('species', `%${normalizedFilters.type}%`);
      }
      if (normalizedFilters.location && normalizedFilters.location !== 'All Malaysia') {
        query = query.ilike('location', `%${normalizedFilters.location}%`);
      }
      if (normalizedFilters.gender && normalizedFilters.gender !== 'Any') {
        query = query.ilike('gender', normalizedFilters.gender);
      }

      const { data, error } = await query;
      if (!error && data?.length) return filterLocalPets(data, normalizedFilters);
    } catch {
      // Local seed data keeps the prototype usable before the live backend is ready.
    }
  }

  return filterLocalPets(localPets, normalizedFilters);
}

export interface FeaturedPetEntry {
  pet: Pet;
  isFeatured: boolean;
}

export function isPetCurrentlyFeatured(pet: Pet): boolean {
  return !!pet.featured_until && new Date(pet.featured_until) > new Date();
}

export async function getFeaturedPets(supabase?: any, limit = 4): Promise<FeaturedPetEntry[]> {
  const nowIso = new Date().toISOString();
  let featured: Pet[] = [];
  let pool: Pet[] = [];

  if (supabase?.from && !supabase.__isMock) {
    try {
      const { data: featuredData } = await supabase
        .from('pets')
        .select('*')
        .gt('featured_until', nowIso)
        .order('featured_until', { ascending: false })
        .limit(limit);
      if (featuredData) featured = featuredData as Pet[];

      if (featured.length < limit) {
        const { data: recentData } = await supabase
          .from('pets')
          .select('*')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(limit + featured.length);
        if (recentData) pool = recentData as Pet[];
      }
    } catch {
      // Local seed data keeps the prototype usable before the live backend is ready.
    }
  }

  if (featured.length === 0 && pool.length === 0) {
    const all = getLocalPets();
    featured = all
      .filter((p) => p.featured_until && new Date(p.featured_until) > new Date())
      .sort((a, b) => new Date(b.featured_until!).getTime() - new Date(a.featured_until!).getTime());
    pool = all.filter((p) => p.status === 'available');
  }

  const seen = new Set(featured.map((p) => p.id));
  const fallback = pool.filter((p) => !seen.has(p.id));

  return [
    ...featured.slice(0, limit).map((pet) => ({ pet, isFeatured: true })),
    ...fallback.slice(0, Math.max(0, limit - featured.length)).map((pet) => ({ pet, isFeatured: false })),
  ].slice(0, limit);
}

export interface PlatformStats {
  animalsListed: number;
  successfulAdoptions: number;
  activeRescuers: number;
}

export async function getPlatformStats(supabase?: any): Promise<PlatformStats> {
  if (supabase?.from && !supabase.__isMock) {
    try {
      const [animalsRes, adoptedRes, rescuersRes] = await Promise.all([
        supabase.from('pets').select('id', { count: 'exact', head: true }),
        supabase.from('pets').select('id', { count: 'exact', head: true }).eq('status', 'adopted'),
        supabase.from('pets').select('rescuer_id'),
      ]);

      const animalsListed = animalsRes.count ?? 0;
      const successfulAdoptions = adoptedRes.count ?? 0;
      const activeRescuers = new Set((rescuersRes.data || []).map((p: any) => p.rescuer_id).filter(Boolean)).size;

      return { animalsListed, successfulAdoptions, activeRescuers };
    } catch {
      // Fall through to honest zeros below.
    }
  }

  return { animalsListed: 0, successfulAdoptions: 0, activeRescuers: 0 };
}

export async function fetchPetById(supabase: any, id: string) {
  if (supabase?.from && !supabase.__isMock) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*, profiles!pets_rescuer_id_fkey(*)')
        .eq('id', id)
        .single();

      if (!error && data) return data as Pet;
    } catch {
      // Fall through to local seed data.
    }
  }

  return findLocalPetById(id);
}
