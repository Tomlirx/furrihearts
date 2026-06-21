'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Pet } from '@/lib/pet-service';
import './PetCard.css';

export default function PetCard({
  pet,
  featured = false,
}: {
  pet: Pet;
  featured?: boolean;
}) {
  const t = useTranslations('PetCard');

  return (
    <Link href={`/pet/${pet.id}`} className={`pet-card ${featured ? 'featured' : ''}`}>
      <div className="pet-img">
        <img src={pet.image_url} alt={pet.name} loading="lazy" />
        {pet.status === 'adopted' ? (
          <span className="adopted-badge">{t('adopted')}</span>
        ) : featured ? (
          <span className="featured-tag">{t('featured')}</span>
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
