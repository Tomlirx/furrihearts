'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Paw } from '@/components/icons';
import { ShareButton } from '@/components/pet/ShareButton';
import type { Pet } from '@/lib/pet-service';

export function RescuerSidebar({
  pet,
  rescuerName,
  currentUserId,
  userApplication,
}: {
  pet: Pet;
  rescuerName: string;
  currentUserId: string | null;
  userApplication: { status: string } | null;
}) {
  const t = useTranslations('PetDetail.sidebar');
  const benefits = t.raw('benefits') as string[];

  const isOwnPet = Boolean(currentUserId && pet.rescuer_id && currentUserId === pet.rescuer_id);
  const isBlockingApplication = userApplication && ['pending', 'approved'].includes(userApplication.status);

  return (
    <div className="right-card">
      <h4 className="right-card-heading">{t('interestedIn', { name: pet.name })}</h4>

      <div className="rescuer-row">
        <div className="rescuer-avatar"><Paw size={30} style={{ color: 'var(--accent-soft)' }} /></div>
        <div>
          <div className="rescuer-name">{rescuerName}</div>
          <div className="rescuer-verified-badge">{t('verifiedRescuer')}</div>
          <Link href={`/profile/${pet.rescuer_id}`} className="rescuer-link">{t('viewRescuerInfo')}</Link>
        </div>
      </div>

      {isOwnPet ? (
        <div className="application-status-banner status-pending">{t('ownListing')}</div>
      ) : pet.status !== 'available' ? (
        <div className="application-status-banner status-adopted">
          {userApplication?.status === 'closed' ? t('adoptedByYou') : t('happilyAdopted')}
        </div>
      ) : !isBlockingApplication ? (
        <>
          <Link href={`/apply/${pet.id}`} style={{ display: 'block', background: 'var(--orange)', color: '#fff', borderRadius: '10px', padding: '14px', textAlign: 'center', fontSize: '15px', fontWeight: 700, textDecoration: 'none', marginBottom: '10px' }}>
            {t('imInterested')}
          </Link>
          <div style={{ fontSize: '12px', color: 'var(--light)', textAlign: 'center' }}>{t('repliesWithinDay')}</div>
        </>
      ) : (
        <div className={`application-status-banner status-${userApplication!.status}`}>
          {userApplication!.status === 'pending' && t('applicationUnderReview')}
          {userApplication!.status === 'approved' && t('applicationApproved')}
        </div>
      )}

      <div className="benefits-list">
        {benefits.map((item) => (
          <div key={item} className="benefit-item">
            <span className="benefit-check">✓</span> {item}
          </div>
        ))}
      </div>

      <ShareButton pet={pet} />
    </div>
  );
}
