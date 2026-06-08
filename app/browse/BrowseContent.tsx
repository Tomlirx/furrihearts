'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PetCard } from '@/components/PetCard';
export default function BrowseContent({ userRole }: { userRole: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [gender, setGender] = useState('Any');
  const [location, setLocation] = useState('All Malaysia');

  useEffect(() => {
    async function fetchFilteredPets() {
      setLoading(true);
      // Corrected query without the missing 'tags' column
// Updated query including 'breed'
let query = supabase
  .from('pets')
  .select('id, name, breed, gender, location, status, species, image_url') 
  .in('status', ['available', 'adopted']); // Only show available pets

      if (type !== 'all') query = query.ilike('species', `%${type}%`);
      if (location !== 'All Malaysia') query = query.ilike('location', `%${location}%`);
      if (gender !== 'Any') query = query.ilike('gender', gender);

      const { data, error } = await query;
      if (error) console.error("Supabase Error:", error);
      else setPets(data || []);
      
      setLoading(false);
    }
    fetchFilteredPets();
  }, [type, location, gender]);

  // If a Guest tries to save a pet, prompt them to sign in
  const handleSavePet = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (userRole === 'guest') {
      alert("Please sign in to save your favorite pets!");
      router.push('/login');
    } else {
      // Future logic: Save to 'saved_pets' table
      console.log("Saving pet for user...");
    }
  };

  return (
    <div className="page-layout">
      <aside className="sidebar">
        <h3>🔍 Filters</h3>
        <div className="filter-group">
          <span className="filter-label">Pet Type</span>
          <div className="filter-options">
            <button className={`filter-btn ${type === 'all' ? 'active' : ''}`} onClick={() => setType('all')}>All</button>
            <button className={`filter-btn ${type === 'cat' ? 'active' : ''}`} onClick={() => setType('cat')}>🐱 Cat</button>
            <button className={`filter-btn ${type === 'dog' ? 'active' : ''}`} onClick={() => setType('dog')}>🐶 Dog</button>
          </div>
        </div>
        
        <div className="filter-group">
          <span className="filter-label">Gender</span>
          <div className="filter-options">
            <button className={`filter-btn ${gender === 'Any' ? 'active' : ''}`} onClick={() => setGender('Any')}>Any</button>
            <button className={`filter-btn ${gender === 'Male' ? 'active' : ''}`} onClick={() => setGender('Male')}>Male</button>
            <button className={`filter-btn ${gender === 'Female' ? 'active' : ''}`} onClick={() => setGender('Female')}>Female</button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Location</span>
          <select className="location-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option>All Malaysia</option>
            <option>Kuala Lumpur</option>
            <option>Selangor</option>
            <option>Penang</option>
            <option>Johor</option>
          </select>
        </div>

        <div className="furrimatch-banner">
          <h4>✨ Try FurriMatch</h4>
          <p>Let our quiz find your perfect pet based on your lifestyle!</p>
          <Link href="/furrimatch" className="btn-furi">Find My Match</Link>
        </div>
      </aside>

      <main className="main-content">
        <div className="browse-header">
          <h1>Find Your New Best Friend</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <p>{loading ? "Searching..." : `${pets.length} pets available`}</p>
            
            {/* Contextual UI: Only show 'List a Pet' to Rescuers */}
            {(userRole === 'rescuer' || userRole === 'both') && (
              <Link href="/dashboard/add-pet" className="btn-furi" style={{ padding: '6px 12px', width: 'auto' }}>
                + Add Pet
              </Link>
            )}
          </div>
        </div>

       <div className="pets-grid">
  {pets.length > 0 ? (
    pets.map((pet) => (
      // We pass the pet and the save function to the component
      <PetCard key={pet.id} pet={pet} onSave={handleSavePet} />
    ))
  ) : (
    !loading && <p>No pets found matching your filters.</p>
  )}
</div>
      </main>
    </div>
  );
}