// lib/pet-service.ts
import { supabase } from './supabase';

export async function fetchPets(filter?: string) {
  let query = supabase.from('pets').select('*');
  if (filter && filter !== 'All') {
    query = query.eq('breed', filter);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchPetById(id: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}