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
