import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; loc?: string }>;
}) {
  const resolvedParams = await searchParams;
  const { type, loc } = resolvedParams;

  // 1. Build the Supabase Query dynamically based on the search
  let query = supabase.from('pets').select('*');

  // If they selected a type, filter by it (assuming you have a 'species' column in DB)
  if (type) {
    query = query.eq('species', type); 
  }
  // If they selected a location, filter by it
  if (loc && loc !== 'Anywhere') {
    query = query.ilike('location', `%${loc}%`); // Use ilike for case-insensitive partial match
  }

  // 2. Execute the query
  const { data: pets, error } = await query;

  if (error) {
    console.error("Error fetching pets:", error);
  }

  return (
    <main style={{ padding: '48px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '36px', fontWeight: 700 }}>
          Find your companion
        </h1>
        <p style={{ color: 'var(--mid)', marginTop: '8px' }}>
          {pets?.length || 0} pets available {loc && loc !== 'Anywhere' ? `in ${loc}` : 'across Malaysia'}
        </p>
      </div>

      {pets && pets.length > 0 ? (
        <div className="pets-grid">
          {pets.map((pet) => (
            <Link href={`/pet/${pet.id}`} key={pet.id} className="pet-card">
              <div className="pet-card-img" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={pet.image_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="pet-card-info">
                <div className="pet-card-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {pet.name}
                  <span style={{ color: 'var(--orange)', fontSize: '14px', fontWeight: 700 }}>→</span>
                </div>
                <div className="pet-card-meta">{pet.age} years old · {pet.breed}</div>
                <div className="pet-card-tags">
                  <span className="pet-tag">Available</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ padding: '64px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😿</div>
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>No pets found</h3>
          <p style={{ color: 'var(--mid)', marginTop: '8px' }}>Try adjusting your search filters.</p>
          <Link href="/browse" className="btn-ghost" style={{ display: 'inline-block', marginTop: '16px' }}>Clear Filters</Link>
        </div>
      )}
    </main>
  );
}