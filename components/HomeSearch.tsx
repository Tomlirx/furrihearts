'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HomeSearch() {
  const router = useRouter();
  const [petType, setPetType] = useState<'cat' | 'dog' | 'all'>('all');
  const [location, setLocation] = useState('Anywhere');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Build the query string based on user selection
    const params = new URLSearchParams();
    if (petType !== 'all') params.set('type', petType);
    if (location !== 'Anywhere') params.set('loc', location);
    
    // Send the user to the browse page with the filters
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
                  border: 'none', borderRadius: '24px', padding: '9px 20px', fontSize: '14px', fontWeight: petType === 'cat' ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s'
                }}
              >🐱 Cat</button>
              <button 
                type="button"
                onClick={() => setPetType('dog')}
                style={{
                  background: petType === 'dog' ? 'var(--orange)' : 'transparent',
                  color: petType === 'dog' ? '#fff' : 'var(--mid)',
                  border: 'none', borderRadius: '24px', padding: '9px 20px', fontSize: '14px', fontWeight: petType === 'dog' ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s'
                }}
              >🐶 Dog</button>
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
              <option value="Anywhere">Anywhere in Malaysia</option>
              <option value="Kuala Lumpur">Kuala Lumpur</option>
              <option value="Selangor">Selangor</option>
              <option value="Penang">Penang</option>
              <option value="Johor">Johor</option>
            </select>
          </div>

          <button type="submit" className="btn-search">Find a Pet 🐾</button>
        </form>
      </div>
    </div>
  );
}