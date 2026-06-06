'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HomeSearch() {
  const router = useRouter();
  
  // Default to 'cat' to match your original HTML design
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [location, setLocation] = useState('Anywhere in Malaysia');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    params.set('type', petType);
    
    if (location !== 'Anywhere in Malaysia') {
      params.set('loc', location);
    }
    
    // Navigate to the browse page with the selected filters
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="search-wrap">
      <div className="search-section">
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
          
          {/* Cat / Dog toggle */}
          <div style={{ padding: '0 20px', flexShrink: 0 }}>
            <div style={{ display: 'flex', background: 'var(--cream)', borderRadius: '30px', padding: '4px', gap: '4px', border: '1px solid var(--border)' }}>
              
              <button 
                type="button"
                onClick={() => setPetType('cat')}
                style={{
                  background: petType === 'cat' ? 'var(--orange)' : 'transparent',
                  color: petType === 'cat' ? '#fff' : 'var(--mid)',
                  border: 'none', 
                  borderRadius: '24px', 
                  padding: '9px 20px', 
                  fontSize: '14px', 
                  fontWeight: petType === 'cat' ? 700 : 500, 
                  cursor: 'pointer', 
                  fontFamily: 'inherit', 
                  transition: 'all .2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🐱 Cat
              </button>

              <button 
                type="button"
                onClick={() => setPetType('dog')}
                style={{
                  background: petType === 'dog' ? 'var(--orange)' : 'transparent',
                  color: petType === 'dog' ? '#fff' : 'var(--mid)',
                  border: 'none', 
                  borderRadius: '24px', 
                  padding: '9px 20px', 
                  fontSize: '14px', 
                  fontWeight: petType === 'dog' ? 700 : 500, 
                  cursor: 'pointer', 
                  fontFamily: 'inherit', 
                  transition: 'all .2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🐶 Dog
              </button>

            </div>
          </div>

          <div className="search-divider"></div>

          {/* Location */}
          <div className="search-field">
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--light)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>📍 Where in Malaysia?</label>
            <select 
              className="search-select" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="Anywhere in Malaysia">Anywhere in Malaysia</option>
              <option value="Kuala Lumpur">Kuala Lumpur</option>
              <option value="Selangor">Selangor</option>
              <option value="Penang">Penang</option>
              <option value="Johor">Johor</option>
              <option value="Perak">Perak</option>
              <option value="Melaka">Melaka</option>
              <option value="Negeri Sembilan">Negeri Sembilan</option>
              <option value="Pahang">Pahang</option>
              <option value="Terengganu">Terengganu</option>
              <option value="Kelantan">Kelantan</option>
              <option value="Kedah">Kedah</option>
              <option value="Perlis">Perlis</option>
              <option value="Sabah">Sabah</option>
              <option value="Sarawak">Sarawak</option>
              <option value="Putrajaya">Putrajaya</option>
              <option value="Labuan">Labuan</option>
            </select>
          </div>

          <button type="submit" className="btn-search">Find a Pet 🐾</button>
        </form>
      </div>
    </div>
  );
}