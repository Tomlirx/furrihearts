'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PetCard } from './PetCard';

export function PetGrid() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPets() {
      const { data, error } = await supabase.from('pets').select('*');
      if (error) console.error("Error fetching:", error);
      else setPets(data || []);
      setLoading(false);
    }
    loadPets();
  }, []);

  if (loading) return <div className="py-20 text-center">Loading companions...</div>;
  if (pets.length === 0) return <div className="py-20 text-center">No pets available yet.</div>;

  return (
    <div className="grid md:grid-cols-3 gap-8 py-12">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}