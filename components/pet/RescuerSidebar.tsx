'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Pet } from '@/lib/pet-service';
import MessageComposer from '@/components/MessageComposer';

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
  const isClosedConversation = userApplication?.status === 'cancelled' || userApplication?.status === 'closed';
  const canMessage = Boolean(
    currentUserId && pet.rescuer_id && pet.rescuer_id !== 'demo-rescuer' && currentUserId !== pet.rescuer_id
  ) && !isClosedConversation;
  const isBlockingApplication = userApplication && ['pending', 'approved'].includes(userApplication.status);

  return (
    <div className="right-card">
      <h4 className="right-card-heading">{t('interestedIn', { name: pet.name })}</h4>

      <div className="rescuer-row">
        <div className="rescuer-avatar">FH</div>
        <div>
          <div className="rescuer-name">{rescuerName}</div>
          <div className="rescuer-verified-badge">{t('verifiedRescuer')}</div>
          <Link href={`/profile/${pet.rescuer_id}`} className="rescuer-link">{t('viewRescuerInfo')}</Link>
        </div>
      </div>

      {canMessage && (
        <div style={{ marginBottom: '12px' }}>
          <MessageComposer
            recipientId={pet.rescuer_id!}
            petId={pet.id}
            triggerLabel={t('messageFirstName', { name: rescuerName.split(' ')[0] })}
            triggerClassName="btn-message"
          />
        </div>
      )}

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
    </div>
  );
}
