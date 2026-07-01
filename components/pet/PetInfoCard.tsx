import { useTranslations } from 'next-intl';
import type { Pet } from '@/lib/pet-service';

// pet/[id]/page.tsx is a Client Component (data fetched in a useEffect), so
// every component it renders — this one included, despite having no 'use
// client' of its own — executes on the client. getTranslations() would fail
// here; useTranslations() (reading from the scoped provider set up in
// app/pet/[id]/layout.tsx) is the correct, client-safe hook.
export function PetInfoCard({ pet }: { pet: Pet }) {
  const t = useTranslations('PetDetail.infoCard');

  const alwaysShowItems: [string, boolean | undefined][] = [
    [t('vaccinated'), pet.is_vaccinated],
    [t('dewormed'), pet.is_dewormed],
    [t('neutered'), pet.is_neutered],
    [t('fleaTreated'), pet.is_flea_treated],
    [t('pottyTrained'), pet.is_potty_trained],
    ...(pet.species === 'dog' ? ([
      [t('heartwormTested'), pet.is_heartworm_tested],
    ] as [string, boolean | undefined][]) : []),
  ];

  // These are only shown when actually tested (true) — an untested badge
  // would otherwise look like a confirmed "not tested" result to adopters.
  const onlyIfTrueItems = ([
    [t('parvoTested'), pet.is_parvo_tested],
    [t('giardiaTested'), pet.is_giardia_tested],
    ...(pet.species === 'cat' ? ([
      [t('fivTested'), pet.is_fiv_tested],
      [t('felvTested'), pet.is_felv_tested],
      [t('fcovTested'), pet.is_fcov_tested],
    ] as [string, boolean | undefined][]) : []),
  ] as [string, boolean | undefined][]).filter(([, checked]) => checked);

  const healthItems = [...alwaysShowItems, ...onlyIfTrueItems];

  return (
    <div className="section-card">
      <h2>{t('aboutPet', { name: pet.name })}</h2>
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
          <h4 className="about-heading">{t('healthMedical')}</h4>
          <ul className="health-list">
            {healthItems.map(([label, checked]) => (
              <li key={label}>
                <div className={`check-icon ${!checked ? 'unchecked' : ''}`}>{checked ? '✓' : '✕'}</div>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="about-heading">{t('adoptionInformation')}</h4>
          <ul className="health-list">
            <li className="adoption-info-row">
              <span className="info-label">{t('adoptionFee')}</span>
              <span className="info-value">RM {pet.fee || '0'}</span>
            </li>
            <li className="adoption-info-row">
              <span className="info-label">{t('location')}</span>
              <span className="info-value">{pet.location}</span>
            </li>
            <li className="adoption-info-row">
              <span className="info-label">{t('status')}</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>{pet.status}</span>
            </li>
            <li className="adoption-info-row">
              <span className="info-label">{t('strictlyIndoor')}</span>
              <span className="info-value">{pet.is_strictly_indoor ? 'Yes' : 'No'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
