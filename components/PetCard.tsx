'use client';

import Link from 'next/link';
import type { Pet } from '@/lib/pet-service';
import './PetCard.css';

export default function PetCard({
  pet,
  featured = false,
  isSaved = false,
  onToggleSave,
}: {
  pet: Pet;
  featured?: boolean;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent, petId: string) => void;
}) {
  return (
    <Link href={`/pet/${pet.id}`} className={`pet-card ${featured ? 'featured' : ''}`}>
      <div className="pet-img">
        <img src={pet.image_url} alt={pet.name} />
        {pet.status === 'adopted' ? (
          <span className="adopted-badge">Adopted</span>
        ) : featured ? (
          <span className="featured-tag">Featured</span>
        ) : null}
        {onToggleSave && (
          <button
            className="save-btn"
            aria-label={isSaved ? `Unsave ${pet.name}` : `Save ${pet.name}`}
            onClick={(event) => onToggleSave(event, pet.id)}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        )}
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
