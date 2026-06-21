'use client';

import { useState } from 'react';
import Link from 'next/link';

const BATCH_SIZE = 12;

export default function PublicListingsGrid({ pets }: { pets: any[] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const visiblePets = pets.slice(0, visibleCount);

  return (
    <>
      <div className="public-listings-grid">
        {visiblePets.map((pet: any) => (
          <Link key={pet.id} href={`/pet/${pet.id}`} className="public-listing-card">
            <img src={pet.image_url} alt={pet.name} loading="lazy" />
            <div className="public-listing-info">
              <h4>{pet.name} · {pet.gender}</h4>
              <p>{pet.age} · {pet.location}</p>
              <p className="public-listing-fee">RM{pet.fee || 0}</p>
            </div>
          </Link>
        ))}
      </div>
      {visibleCount < pets.length && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button className="btn-outline" onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}>
            Load More
          </button>
        </div>
      )}
    </>
  );
}
