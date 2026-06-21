'use client';

import Link from 'next/link';
import type { Pet } from '@/lib/pet-service';
import './PetCard.css';

// Client Component (no useTranslations — that would need its own
// NextIntlClientProvider just for two badge strings). Callers are Server
// Components that already call getTranslations() for their own page, so
// they pass the two labels down as plain strings, with English defaults
// for any caller that hasn't been localized.
export default function PetCard({
  pet,
  featured = false,
  adoptedLabel = 'Adopted',
  featuredLabel = 'Featured',
}: {
  pet: Pet;
  featured?: boolean;
  adoptedLabel?: string;
  featuredLabel?: string;
}) {
  return (
    <Link href={`/pet/${pet.id}`} className={`pet-card ${featured ? 'featured' : ''}`}>
      <div className="pet-img">
        <img src={pet.image_url} alt={pet.name} loading="lazy" />
        {pet.status === 'adopted' ? (
          <span className="adopted-badge">{adoptedLabel}</span>
        ) : featured ? (
          <span className="featured-tag">{featuredLabel}</span>
        ) : null}
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
}
