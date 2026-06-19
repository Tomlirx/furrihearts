'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { filterLocalPets, getLocalPets, type Pet } from '@/lib/pet-service';
import { getLocalListings, getSavedPetIds, toggleSavedPet } from '@/lib/local-store';

export default function BrowseContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const searchParams = useSearchParams();
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [savedPetIds, setSavedPetIds] = useState<string[]>([]);
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [gender, setGender] = useState('Any');
  const [location, setLocation] = useState(searchParams.get('loc') || 'All Malaysia');
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setAllPets(getLocalPets(getLocalListings()));
    setSavedPetIds(getSavedPetIds());
  }, []);

  const pets = useMemo(() => (
    filterLocalPets(allPets, { search, type, gender, location })
  ), [allPets, search, type, gender, location]);

  const spotlightPets = pets.slice(0, 3);
  const remainingPets = pets.slice(3);

  const handleSavePet = (e: React.MouseEvent, petId: string) => {
    e.preventDefault();
    setSavedPetIds(toggleSavedPet(petId));
  };

  const resetFilters = () => {
    setType('all');
    setGender('Any');
    setLocation('All Malaysia');
    setSearch('');
  };

  const FilterControls = () => (
    <>
      <div className="filter-group">
        <span className="filter-label">Search</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, breed, trait..."
          style={{
            width: '100%',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 14px',
            font: 'inherit',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      <div className="filter-group">
        <span className="filter-label">Pet Type</span>
        <div className="filter-options">
          <button className={`filter-btn ${type === 'all' ? 'active' : ''}`} onClick={() => setType('all')}>All</button>
          <button className={`filter-btn ${type === 'cat' ? 'active' : ''}`} onClick={() => setType('cat')}>Cat</button>
          <button className={`filter-btn ${type === 'dog' ? 'active' : ''}`} onClick={() => setType('dog')}>Dog</button>
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
        <select className="location-select" value={location} onChange={(event) => setLocation(event.target.value)}>
          <option>All Malaysia</option>
          <option>Kuala Lumpur</option>
          <option>Selangor</option>
          <option>Penang</option>
          <option>Johor</option>
        </select>
      </div>

      <button className="btn-outline" type="button" onClick={resetFilters} style={{ width: '100%' }}>
        Reset filters
      </button>
    </>
  );

  const PetCard = ({ pet, featured = false }: { pet: Pet; featured?: boolean }) => {
    const isSaved = savedPetIds.includes(pet.id);

    return (
      <Link href={`/pet/${pet.id}`} className={`pet-card ${featured ? 'featured' : ''}`}>
        <div className="pet-img">
          <img src={pet.image_url} alt={pet.name} />
          {pet.status === 'adopted' ? (
            <span className="adopted-badge">Adopted</span>
          ) : featured ? (
            <span className="featured-tag">Featured</span>
          ) : null}
          <button
            className="save-btn"
            aria-label={isSaved ? `Unsave ${pet.name}` : `Save ${pet.name}`}
            onClick={(event) => handleSavePet(event, pet.id)}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        </div>
        <div className="pet-info">
          <div className="pet-name-row">
            <span className="pet-name">{pet.name}</span>
            <span className="pet-arrow">→</span>
          </div>
          <div className="pet-meta">{pet.gender} · {pet.location}</div>
          <div className="pet-tags">
            <span className={`pet-tag ${featured ? '' : 'neutral'}`}>{pet.breed}</span>
            {pet.traits?.slice(0, 1).map((trait) => (
              <span key={trait} className="pet-tag neutral">{trait}</span>
            ))}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="filter-overlay" onClick={() => setIsFilterOpen(false)}></div>
        <div className="filter-panel">
          <div className="filter-handle"></div>
          <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>Filters</h3>
          <FilterControls />
          <button
            onClick={() => setIsFilterOpen(false)}
            style={{ width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="page-layout">
        <aside className="sidebar">
          <h3>Filters</h3>
          <FilterControls />

          <div className="furrimatch-banner">
            <h4>Try FurriMatch</h4>
            <p>Let our quiz find your perfect pet based on your lifestyle.</p>
            <Link href="/furrimatch" className="btn-furi">Find My Match</Link>
          </div>
        </aside>

        <main className="main-content">
          <div className="browse-header">
            <div>
              <h1>Find Your New Best Friend</h1>
              <p>{pets.length} pets available across Malaysia · {savedPetIds.length} saved</p>
            </div>
            {isLoggedIn && <Link href="/rescuer-listing" className="btn-outline">Add listing</Link>}
          </div>

          <button className="filter-toggle" onClick={() => setIsFilterOpen(true)}>
            Filters & Search
          </button>

          {spotlightPets.length > 0 && (
            <>
              <div className="section-label">Spotlight Pets</div>
              <div className="spotlight-grid">
                {spotlightPets.map((pet) => <PetCard key={pet.id} pet={pet} featured />)}
              </div>
            </>
          )}

          {remainingPets.length > 0 && (
            <>
              <div className="section-divider">
                <div className="section-label" style={{ color: 'var(--mid)' }}>All Pets</div>
              </div>
              <div className="pets-grid">
                {remainingPets.map((pet) => <PetCard key={pet.id} pet={pet} />)}
              </div>
            </>
          )}

          {pets.length === 0 && (
            <div className="load-more-row">
              <p>No pets found matching your criteria.</p>
              <button className="btn-outline" onClick={resetFilters}>Clear search</button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
