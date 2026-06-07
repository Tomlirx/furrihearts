'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronized state variables: Use 'location' everywhere
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [gender, setGender] = useState('Any');
  const [location, setLocation] = useState('All Malaysia');

  useEffect(() => {
    async function fetchFilteredPets() {
      setLoading(true);
      let query = supabase.from('pets').select('*');

      if (type !== 'all') query = query.ilike('species', `%${type}%`);
      if (location !== 'All Malaysia') query = query.ilike('location', `%${location}%`);
      if (gender !== 'Any') query = query.ilike('gender', gender);

      const { data, error } = await query;
      if (error) console.error("Supabase Error:", error);
      else setPets(data || []);
      
      setLoading(false);
    }
    fetchFilteredPets();
  }, [type, location, gender]); // Dependency array now correctly uses 'location'

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
          <p>{loading ? "Searching..." : `${pets.length} pets available`}</p>
        </div>

        {/* This div now persists in the DOM, preventing the empty main-content issue */}
        <div className="pets-grid">
          {pets.length > 0 ? (
            pets.map((pet) => (
              <Link href={`/pet/${pet.id}`} key={pet.id} className="pet-card">
                <div className="pet-img">
                  <img src={pet.image_url} alt={pet.name} />
                  <button className="save-btn" onClick={(e) => e.preventDefault()}>🤍</button>
                </div>
                <div className="pet-info">
                  <div className="pet-name-row">
                    <span className="pet-name">{pet.name}</span>
                    <span className="pet-arrow">→</span>
                  </div>
                  <div className="pet-meta">{pet.gender} · {pet.location}</div>
                </div>
              </Link>
            ))
          ) : (
            !loading && <p>No pets found matching your filters.</p>
          )}
        </div>
      </main>
    </div>
  );
}