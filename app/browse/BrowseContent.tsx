'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchPets, filterLocalPets, getLocalPets, isPetCurrentlyFeatured, type Pet } from '@/lib/pet-service';
import { getLocalListings } from '@/lib/local-store';
import { supabase } from '@/lib/supabase';
import PetCard from '@/components/PetCard';
import EmptyState from '@/components/EmptyState';

interface FilterControlsProps {
  search: string;
  setSearch: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  resetFilters: () => void;
  launchedStates: string[];
}

function FilterControls({ search, setSearch, type, setType, gender, setGender, location, setLocation, resetFilters, launchedStates }: FilterControlsProps) {
  return (
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
          {launchedStates.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>
      </div>

      <button className="btn-outline" type="button" onClick={resetFilters} style={{ width: '100%' }}>
        Reset filters
      </button>
    </>
  );
}

const BATCH_SIZE = 12;

export default function BrowseContent({ launchedStates }: { launchedStates: string[] }) {
  const searchParams = useSearchParams();
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [gender, setGender] = useState('Any');
  const [location, setLocation] = useState(searchParams.get('loc') || 'All Malaysia');
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  useEffect(() => {
    async function loadPets() {
      const dbPets = await fetchPets(supabase);
      setAllPets(getLocalPets([...getLocalListings(), ...dbPets]));
    }
    loadPets();
  }, []);

  const pets = useMemo(() => (
    filterLocalPets(allPets, { search, type, gender, location })
  ), [allPets, search, type, gender, location]);

  const sortedPets = useMemo(() => {
    const featured = pets
      .filter(isPetCurrentlyFeatured)
      .sort((a, b) => new Date(b.featured_until!).getTime() - new Date(a.featured_until!).getTime());
    const rest = pets.filter((p) => !isPetCurrentlyFeatured(p));
    return [...featured, ...rest];
  }, [pets]);

  const spotlightPets = sortedPets.slice(0, 3);
  const remainingPets = sortedPets.slice(3);
  const visiblePets = remainingPets.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [search, type, gender, location]);

  const resetFilters = () => {
    setType('all');
    setGender('Any');
    setLocation('All Malaysia');
    setSearch('');
  };

  const filterControlsProps: FilterControlsProps = {
    search, setSearch, type, setType, gender, setGender, location, setLocation, resetFilters, launchedStates,
  };

  return (
    <>
      <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="filter-overlay" onClick={() => setIsFilterOpen(false)}></div>
        <div className="filter-panel">
          <div className="filter-handle"></div>
          <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>Filters</h3>
          <FilterControls {...filterControlsProps} />
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
          <FilterControls {...filterControlsProps} />
        </aside>

        <main className="main-content">
          <div className="browse-header">
            <div>
              <h1>Find Your New Best Friend</h1>
              <p>{pets.length} pets available across Malaysia</p>
            </div>
          </div>

          <button className="filter-toggle" onClick={() => setIsFilterOpen(true)}>
            Filters & Search
          </button>

          {spotlightPets.length > 0 && (
            <>
              <div className="section-label">Spotlight Pets</div>
              <div className="spotlight-grid">
                {spotlightPets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} featured={isPetCurrentlyFeatured(pet)} />
                ))}
              </div>
            </>
          )}

          {remainingPets.length > 0 && (
            <>
              <div className="section-divider">
                <div className="section-label" style={{ color: 'var(--mid)' }}>All Pets</div>
              </div>
              <div className="pets-grid">
                {visiblePets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} featured={isPetCurrentlyFeatured(pet)} />
                ))}
              </div>
              {visibleCount < remainingPets.length && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button className="btn-outline" onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}>
                    Load More
                  </button>
                </div>
              )}
            </>
          )}

          {pets.length === 0 && (
            <EmptyState
              icon="🔍"
              title="No pets found"
              description="Try adjusting your filters or search to see more pets."
              ctaLabel="Clear filters"
              onCta={resetFilters}
            />
          )}
        </main>
      </div>
    </>
  );
}
