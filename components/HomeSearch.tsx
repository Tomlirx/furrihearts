'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function HomeSearch({ launchedStates }: { launchedStates: string[] }) {
  const t = useTranslations('HomeSearch');
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
                {t('cat')}
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
                {t('dog')}
              </button>

            </div>
          </div>

          <div className="search-divider"></div>

          {/* Location */}
          <div className="search-field">
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--light)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>{t('locationLabel')}</label>
            {/* State names stay English regardless of locale — the option
                text doubles as the filter value, so translating it would
                require a separate value/label split for no real benefit. */}
            <select
              className="search-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="Anywhere in Malaysia">Anywhere in Malaysia</option>
              {launchedStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-search">{t('submit')}</button>
        </form>
      </div>
    </div>
  );
}