import type { Pet } from '@/lib/pet-service';

export function PetInfoCard({ pet }: { pet: Pet }) {
  return (
    <div className="section-card">
      <h2>About {pet.name}</h2>
      <div className="pet-meta-line">{pet.gender} · {pet.age} · {pet.location}</div>

      {!!pet.traits?.length && (
        <div className="trait-pills">
          {pet.traits.map((trait) => (
            <span key={trait} className="trait-pill">{trait}</span>
          ))}
        </div>
      )}

      <p className="pet-description">{pet.description}</p>

      <div className="about-grid">
        <div>
          <h4 className="about-heading">Health & Medical</h4>
          <ul className="health-list">
            {[
              ['Vaccinated', pet.is_vaccinated],
              ['Dewormed', pet.is_dewormed],
              ['Neutered', pet.is_neutered],
              ['Flea Treated', pet.is_flea_treated],
              ['Potty Trained', pet.is_potty_trained],
            ].map(([label, checked]) => (
              <li key={label as string}>
                <div className={`check-icon ${!checked ? 'unchecked' : ''}`}>{checked ? '✓' : '✕'}</div>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="about-heading">Adoption Information</h4>
          <ul className="health-list">
            <li className="adoption-info-row">
              <span className="info-label">Adoption Fee</span>
              <span className="info-value">RM {pet.fee || '0'}</span>
            </li>
            <li className="adoption-info-row">
              <span className="info-label">Location</span>
              <span className="info-value">{pet.location}</span>
            </li>
            <li className="adoption-info-row">
              <span className="info-label">Status</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>{pet.status}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
