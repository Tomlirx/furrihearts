// lib/pet-service.ts

export async function fetchPets(supabase: any, filter?: string) {
  let query = supabase.from('pets').select('*');
  
  if (filter && filter !== 'All') {
    query = query.eq('breed', filter);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchPetById(supabase: any, id: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}