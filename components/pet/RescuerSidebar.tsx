'use client';

import Link from 'next/link';
import type { Pet } from '@/lib/pet-service';
import MessageComposer from '@/components/MessageComposer';

const BENEFITS = ['Takes 3 minutes', 'No commitment', 'Rescuer notified immediately'];

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
  const isOwnPet = Boolean(currentUserId && pet.rescuer_id && currentUserId === pet.rescuer_id);
  const isClosedConversation = userApplication?.status === 'cancelled' || userApplication?.status === 'closed';
  const canMessage = Boolean(
    currentUserId && pet.rescuer_id && pet.rescuer_id !== 'demo-rescuer' && currentUserId !== pet.rescuer_id
  ) && !isClosedConversation;
  const isBlockingApplication = userApplication && ['pending', 'approved'].includes(userApplication.status);

  return (
    <div className="right-card">
      <h4 className="right-card-heading">Interested in {pet.name}?</h4>

      <div className="rescuer-row">
        <div className="rescuer-avatar">FH</div>
        <div>
          <div className="rescuer-name">{rescuerName}</div>
          <div className="rescuer-verified-badge">Verified Rescuer</div>
          <Link href={`/profile/${pet.rescuer_id}`} className="rescuer-link">View Rescuer Info →</Link>
        </div>
      </div>

      {canMessage && (
        <div style={{ marginBottom: '12px' }}>
          <MessageComposer
            recipientId={pet.rescuer_id!}
            petId={pet.id}
            triggerLabel={`Message ${rescuerName.split(' ')[0]}`}
            triggerClassName="btn-message"
          />
        </div>
      )}

      {isOwnPet ? (
        <div className="application-status-banner status-pending">This is your own listing</div>
      ) : pet.status !== 'available' ? (
        <div className="application-status-banner status-adopted">
          {userApplication?.status === 'closed' ? '🎉 You adopted this pet!' : 'Happily Adopted'}
        </div>
      ) : !isBlockingApplication ? (
        <>
          <Link href={`/apply/${pet.id}`} style={{ display: 'block', background: 'var(--orange)', color: '#fff', borderRadius: '10px', padding: '14px', textAlign: 'center', fontSize: '15px', fontWeight: 700, textDecoration: 'none', marginBottom: '10px' }}>
            I'm Interested
          </Link>
          <div style={{ fontSize: '12px', color: 'var(--light)', textAlign: 'center' }}>Usually replies within 1 day</div>
        </>
      ) : (
        <div className={`application-status-banner status-${userApplication!.status}`}>
          {userApplication!.status === 'pending' && 'Application Under Review'}
          {userApplication!.status === 'approved' && 'Application Approved'}
        </div>
      )}

      <div className="benefits-list">
        {BENEFITS.map((item) => (
          <div key={item} className="benefit-item">
            <span className="benefit-check">✓</span> {item}
          </div>
        ))}
      </div>
    </div>
  );
}
