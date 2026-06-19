'use client';

import './styles.css';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fetchPetById, findLocalPetById, type Pet } from '@/lib/pet-service';
import { getLocalApplications } from '@/lib/local-store';
import MessageComposer from '@/components/MessageComposer';
import { Skeleton, SkeletonText } from '@/components/Skeleton';

export default function PetProfile() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [userApplication, setUserApplication] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPetAndApp() {
      if (!id) return;

      const localPet = findLocalPetById(id);
      if (localPet) {
        setPet(localPet);
        setMainImage(localPet.image_url);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      const petData = await fetchPetById(supabase, id);

      if (petData) {
        setPet(petData);
        setMainImage(petData.image_url);
      }

      const localApplication = getLocalApplications().find((app) => app.pet_id === id);
      if (localApplication) setUserApplication(localApplication);

      if (user) {
        const { data: appData } = await supabase
          .from('applications')
          .select('status')
          .eq('pet_id', id)
          .eq('applicant_id', user.id)
          .maybeSingle();

        if (appData) setUserApplication(appData);
      }

      setLoading(false);
    }

    fetchPetAndApp();
  }, [id]);

  if (loading) {
    return (
      <div className="profile-layout">
        <div>
          <Skeleton height={420} className="main-img" />
          <div className="section-card" style={{ marginTop: '20px' }}>
            <Skeleton height={24} width="40%" style={{ marginBottom: '16px' }} />
            <SkeletonText lines={3} width={['90%', '95%', '60%']} />
          </div>
        </div>
        <div className="right-sidebar">
          <div className="right-card">
            <Skeleton height={20} width="70%" style={{ marginBottom: '16px' }} />
            <Skeleton circle width={48} height={48} style={{ marginBottom: '16px' }} />
            <Skeleton height={48} style={{ marginBottom: '10px' }} />
          </div>
        </div>
      </div>
    );
  }
  if (!pet) return <div style={{ padding: '60px', textAlign: 'center' }}>Pet not found.</div>;

  const photos = pet.gallery?.length ? pet.gallery : [pet.image_url];
  const currentIndex = Math.max(0, photos.indexOf(mainImage));
  const rescuerName = pet.profiles?.first_name
    ? `${pet.profiles.first_name} ${pet.profiles.last_name || ''}`
    : pet.rescuer_name || 'Verified Rescuer';

  return (
    <>
      <div className="top-bar">
        <Link href="/browse" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mid)', fontSize: '14px', textDecoration: 'none' }}>← Back to Browse</Link>
      </div>

      <div className="profile-layout">
        <div>
          <div className="main-img">
            <img src={mainImage || pet.image_url} alt={pet.name} />
            <span className="age-label">{pet.age}</span>

            {photos.length > 1 && (
              <>
                <button onClick={() => setMainImage(photos[(currentIndex - 1 + photos.length) % photos.length])} className="img-nav-btn" style={{ left: '12px' }} aria-label="Previous photo">‹</button>
                <button onClick={() => setMainImage(photos[(currentIndex + 1) % photos.length])} className="img-nav-btn" style={{ right: '12px' }} aria-label="Next photo">›</button>
                <span className="img-counter">{currentIndex + 1} / {photos.length}</span>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="thumbnails">
              {photos.map((url, index) => (
                <div key={url + index} onClick={() => setMainImage(url)} className={`thumb ${mainImage === url ? 'active' : ''}`}>
                  <img src={url} alt={`${pet.name} photo ${index + 1}`} />
                </div>
              ))}
            </div>
          )}

          <div className="section-card">
            <h2>About {pet.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--light)', marginBottom: '10px', textTransform: 'capitalize' }}>
              {pet.gender} · {pet.age} · {pet.location}
            </div>

            {!!pet.traits?.length && (
              <div className="trait-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {pet.traits.map((trait) => (
                  <span key={trait} style={{ border: '1.5px solid var(--orange)', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 500, color: 'var(--orange)', background: 'var(--orange-pale)' }}>
                    {trait}
                  </span>
                ))}
              </div>
            )}

            <p style={{ color: 'var(--mid)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{pet.description}</p>

            <div className="about-grid">
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Health & Medical</h4>
                <ul className="health-list">
                  {[
                    ['Vaccinated', pet.is_vaccinated],
                    ['Dewormed', pet.is_dewormed],
                    ['Neutered', pet.is_neutered],
                    ['Flea Treated', pet.is_flea_treated],
                    ['Potty Trained', pet.is_potty_trained],
                  ].map(([label, checked]) => (
                    <li key={label as string}>
                      <div className={`check-icon ${!checked ? 'unchecked' : ''}`} style={!checked ? { background: '#F3F4F6', color: '#D1D5DB' } : {}}>
                        {checked ? '✓' : '✕'}
                      </div>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Adoption Information</h4>
                <ul className="health-list">
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--light)' }}>Adoption Fee</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>RM {pet.fee || '0'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--light)' }}>Location</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{pet.location}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--light)' }}>Status</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)', textTransform: 'capitalize' }}>{pet.status}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="right-sidebar">
          <div className="right-card">
            <h4 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Interested in {pet.name}?</h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#F0D5B8,#C9A88A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>FH</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{rescuerName}</div>
                <div style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600 }}>Verified Rescuer</div>
                <Link href="/rescuer-landing" style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View Rescuer Info →</Link>
              </div>
            </div>

            {currentUserId && pet.rescuer_id === 'demo-rescuer' && (
              <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--light)', textAlign: 'center', background: 'var(--cream)', borderRadius: '8px', padding: '10px' }}>
                This is sample demo data — there's no real rescuer to message. List a pet yourself to test messaging with a real account.
              </div>
            )}

            {currentUserId && pet.rescuer_id === currentUserId && (
              <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--light)', textAlign: 'center', background: 'var(--cream)', borderRadius: '8px', padding: '10px' }}>
                This is your own listing — log in as a different account to test messaging it.
              </div>
            )}

            {currentUserId && pet.rescuer_id && pet.rescuer_id !== 'demo-rescuer' && currentUserId !== pet.rescuer_id && (
              <div style={{ marginBottom: '12px' }}>
                <MessageComposer
                  recipientId={pet.rescuer_id}
                  petId={pet.id}
                  triggerLabel={`Message ${rescuerName.split(' ')[0]}`}
                  triggerClassName="btn-message"
                />
              </div>
            )}

            {!userApplication ? (
              pet.status === 'available' ? (
                <>
                  <Link href={`/apply/${pet.id}`} style={{ display: 'block', background: 'var(--orange)', color: '#fff', borderRadius: '10px', padding: '14px', textAlign: 'center', fontSize: '15px', fontWeight: 700, textDecoration: 'none', marginBottom: '10px' }}>
                    I'm Interested
                  </Link>
                  <div style={{ fontSize: '12px', color: 'var(--light)', textAlign: 'center' }}>Usually replies within 1 day</div>
                </>
              ) : (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '14px', borderRadius: '10px', textAlign: 'center', fontWeight: 700 }}>
                  Happily Adopted
                </div>
              )
            ) : (
              <div style={{
                background: userApplication.status === 'pending' ? 'var(--cream)' : '#f3f4f6',
                color: userApplication.status === 'pending' ? 'var(--dark)' : 'var(--mid)',
                padding: '14px',
                borderRadius: '10px',
                textAlign: 'center',
                fontWeight: 600,
                border: '1px solid var(--border)',
              }}>
                {userApplication.status === 'pending' && 'Application Under Review'}
                {userApplication.status === 'approved' && 'Application Approved'}
                {userApplication.status === 'rejected' && 'Application Declined'}
                {userApplication.status === 'cancelled' && 'Application Archived'}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              {['Takes 3 minutes', 'No commitment', 'Rescuer notified immediately'].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--mid)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
