'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BrowseContent({ userRole }: { userRole: string }) {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [type, setType] = useState('all');
  const [gender, setGender] = useState('Any');
  const [location, setLocation] = useState('All Malaysia');
  
  // Mobile UI State
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchFilteredPets() {
      setLoading(true);
      let query = supabase
        .from('pets')
        .select('id, name, breed, gender, location, status, species, image_url')
        .in('status', ['available', 'adopted']);

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

  // Separate pets into Spotlight (first 3) and All Pets (the rest) to match design
  const spotlightPets = pets.slice(0, 3);
  const remainingPets = pets.slice(3);

  const handleSavePet = (e: React.MouseEvent) => { e.preventDefault(); };

  // Reusable Filter UI to ensure desktop and mobile match perfectly
  const FilterControls = () => (
    <>
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
    </>
  );

  return (
    <>
      {/* ── MOBILE FILTER DRAWER (Hidden on Desktop) ── */}
      <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="filter-overlay" onClick={() => setIsFilterOpen(false)}></div>
        <div className="filter-panel">
          <div className="filter-handle"></div>
          <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>🔍 Filters</h3>
          
          <FilterControls />
          
          <button 
            onClick={() => setIsFilterOpen(false)} 
            style={{ width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* ── MAIN PAGE LAYOUT ── */}
      <div className="page-layout">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="sidebar">
          <h3>🔍 Filters</h3>
          <FilterControls />
          
          <div className="furrimatch-banner">
            <h4>✨ Try FurriMatch</h4>
            <p>Let our quiz find your perfect pet based on your lifestyle!</p>
            <Link href="/furrimatch" className="btn-furi">Find My Match</Link>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="main-content">
          <div className="browse-header">
            <div>
              <h1>Find Your New Best Friend</h1>
              <p>{loading ? "Searching..." : `${pets.length} pets available across Malaysia`}</p>
            </div>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button className="filter-toggle" onClick={() => setIsFilterOpen(true)}>
            🔍 Filters & Sort
          </button>

          {/* SPOTLIGHT GRID (3 Columns) */}
          {spotlightPets.length > 0 && (
            <>
              <div className="section-label">⭐ Spotlight Pets</div>
              <div className="spotlight-grid">
                {spotlightPets.map((pet) => (
                  <Link href={`/pet/${pet.id}`} key={pet.id} className="pet-card featured">
                    <div className="pet-img">
                      <img src={pet.image_url || 'https://via.placeholder.com/300x250'} alt={pet.name} />
                      {pet.status === 'adopted' ? (
                         <span className="adopted-badge">Adopted</span>
                      ) : (
                         <span className="featured-tag">⭐ FEATURED</span>
                      )}
                      <button className="save-btn" onClick={(e) => { e.preventDefault(); handleSavePet(e); }}>🤍</button>
                    </div>
                    <div className="pet-info">
                      <div className="pet-name-row"><span className="pet-name">{pet.name}</span><span className="pet-arrow">→</span></div>
                      <div className="pet-meta">{pet.gender} · {pet.location}</div>
                      <div className="pet-tags">
                        <span className="pet-tag">{pet.breed}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* ALL PETS GRID (4 Columns) */}
          {remainingPets.length > 0 && (
            <>
              <div className="section-divider">
                <div className="section-label" style={{ color: 'var(--mid)' }}>All Pets</div>
              </div>
              <div className="pets-grid">
                {remainingPets.map((pet) => (
                  <Link href={`/pet/${pet.id}`} key={pet.id} className="pet-card">
                    <div className="pet-img">
                      <img src={pet.image_url || 'https://via.placeholder.com/300x250'} alt={pet.name} />
                      {pet.status === 'adopted' && <span className="adopted-badge">Adopted</span>}
                      <button className="save-btn" onClick={(e) => { e.preventDefault(); handleSavePet(e); }}>🤍</button>
                    </div>
                    <div className="pet-info">
                      <div className="pet-name-row"><span className="pet-name">{pet.name}</span><span className="pet-arrow">→</span></div>
                      <div className="pet-meta">{pet.gender} · {pet.location}</div>
                      <div className="pet-tags">
                        <span className="pet-tag neutral">{pet.breed}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {!loading && pets.length === 0 && (
             <div className="load-more-row"><p>No pets found matching your criteria.</p></div>
          )}

          {pets.length > 0 && (
            <div className="load-more-row">
              <button className="btn-outline">Load more pets</button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}