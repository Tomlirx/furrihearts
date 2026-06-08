'use client';
import './styles.css';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PetProfile() {
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [userApplication, setUserApplication] = useState<any>(null);
  
  // NEW: State for random rescuer stats
  const [adoptionsCount, setAdoptionsCount] = useState<number | string>('--');
  const [experienceYears, setExperienceYears] = useState<number | string>('--');

  useEffect(() => {
    async function fetchPetAndApp() {
      if (!id) return;

      // 1. Get user
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Fetch Pet
      const { data: petData } = await supabase
        .from('pets')
        .select('*, profiles!pets_rescuer_id_fkey(*)')
        .eq('id', id)
        .single();
      
      if (petData) {
        setPet(petData);
        setMainImage(petData.image_url);

        // 3. Fetch existing application for this user
        if (user) {
          const { data: appData } = await supabase
            .from('applications')
            .select('status')
            .eq('pet_id', id)
            .eq('applicant_id', user.id)
            .maybeSingle(); 
          
          if (appData) setUserApplication(appData);
        }
      }
      setLoading(false);
    }
    fetchPetAndApp();

    // NEW: Generate random stats purely on the client-side
    setAdoptionsCount(Math.floor(Math.random() * 100) + 1);
    setExperienceYears(Math.floor(Math.random() * 10) + 1);
  }, [id]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;

  const photos = (pet.gallery && pet.gallery.length > 0) ? pet.gallery : [pet.image_url];
  const currentIndex = photos.indexOf(mainImage);
  
  // Extract rescuer data safely
  const rescuerName = pet.profiles?.first_name 
    ? `${pet.profiles.first_name} ${pet.profiles.last_name || ''}` 
    : 'Verified Rescuer';

  return (
    <>
      <div className="top-bar">
        <Link href="/browse" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mid)', fontSize: '14px', textDecoration: 'none' }}>← Back to Browse</Link>
      </div>

      <div className="profile-layout">
        
          {/* ================= LEFT COLUMN ================= */}
        <div>
          <div className="main-img">
            <img src={mainImage} alt={pet.name} />
            
            {/* FIX 1: Show Age instead of Species */}
            <span className="age-label">{pet.age}</span> 
            
            {photos.length > 1 && (
              <>
                <button onClick={() => setMainImage(photos[(currentIndex - 1 + photos.length) % photos.length])} className="img-nav-btn" style={{ left: '12px' }}>‹</button>
                <button onClick={() => setMainImage(photos[(currentIndex + 1) % photos.length])} className="img-nav-btn" style={{ right: '12px' }}>›</button>
                <span className="img-counter">{currentIndex + 1} / {photos.length}</span>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="thumbnails">
              {photos.map((url: string, index: number) => (
                <div key={index} onClick={() => setMainImage(url)} className={`thumb ${mainImage === url ? 'active' : ''}`}>
                  <img src={url} alt="thumbnail" />
                </div>
              ))}
            </div>
          )}

          <div className="section-card">
            <h2>About {pet.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--light)', marginBottom: '10px', textTransform: 'capitalize' }}>
              {pet.gender} · {pet.age} · {pet.location}
            </div>
            
            {/* FIX 2: Dynamic Trait Pills */}
            {pet.traits && pet.traits.length > 0 && (
              <div className="trait-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {pet.traits.map((trait: string, idx: number) => (
                  <span key={idx} style={{ border: '1.5px solid var(--orange)', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 500, color: 'var(--orange)', background: 'var(--orange-pale)' }}>
                    {trait}
                  </span>
                ))}
              </div>
            )}
            
            <p style={{ color: 'var(--mid)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{pet.description}</p>
            
            <div className="about-grid">
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Health & Medical</h4>
                {/* FIX 3: Dynamic Health Checklist */}
                <ul className="health-list">
                  <li>
                    <div className={`check-icon ${!pet.is_vaccinated ? 'unchecked' : ''}`} style={!pet.is_vaccinated ? { background: '#F3F4F6', color: '#D1D5DB' } : {}}>
                      {pet.is_vaccinated ? '✓' : '✕'}
                    </div> Vaccinated
                  </li>
                  <li>
                    <div className={`check-icon ${!pet.is_dewormed ? 'unchecked' : ''}`} style={!pet.is_dewormed ? { background: '#F3F4F6', color: '#D1D5DB' } : {}}>
                      {pet.is_dewormed ? '✓' : '✕'}
                    </div> Dewormed
                  </li>
                  <li>
                    <div className={`check-icon ${!pet.is_neutered ? 'unchecked' : ''}`} style={!pet.is_neutered ? { background: '#F3F4F6', color: '#D1D5DB' } : {}}>
                      {pet.is_neutered ? '✓' : '✕'}
                    </div> Neutered
                  </li>
                  {/* You can add Flea Treated, Potty Trained, FIV, etc. following this exact pattern */}
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
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div className="right-sidebar">
          <div className="right-card">
            <h4 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Interested in {pet.name}?</h4>

            {/* Dynamic Rescuer Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#F0D5B8,#C9A88A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>👩</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{rescuerName}</div>
                <div style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600 }}>✅ Verified Rescuer</div>
                <Link href="#" style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View Profile →</Link>
              </div>
            </div>

            {/* Stats Box - NOW USING RANDOMIZED STATE */}
            <div style={{ display: 'flex', gap: '16px', padding: '12px', background: 'var(--cream)', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{adoptionsCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--light)' }}>Adoptions</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{experienceYears} yrs</div>
                <div style={{ fontSize: '11px', color: 'var(--light)' }}>Experience</div>
              </div>
            </div>

           {/* CTA Button Logic */}
            {!userApplication ? (
              pet.status === 'available' ? (
                <>
                  <Link href={`/apply/${pet.id}`} style={{ display: 'block', background: 'var(--orange)', color: '#fff', borderRadius: '10px', padding: '14px', textAlign: 'center', fontSize: '15px', fontWeight: 700, textDecoration: 'none', marginBottom: '10px' }}>
                    I'm Interested 🐾
                  </Link>
                  <div style={{ fontSize: '12px', color: 'var(--light)', textAlign: 'center' }}>⏱️ Usually replies within 1 day</div>
                </>
              ) : (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '14px', borderRadius: '10px', textAlign: 'center', fontWeight: 700 }}>
                  🎉 Happily Adopted!
                </div>
              )
            ) : (
              <div style={{ 
                background: userApplication.status === 'pending' ? 'var(--cream)' : '#f3f4f6', 
                color: userApplication.status === 'pending' ? 'var(--dark)' : 'var(--mid)', 
                padding: '14px', borderRadius: '10px', textAlign: 'center', fontWeight: 600, border: '1px solid var(--border)' 
              }}>
                {userApplication.status === 'pending' && "⏱️ Application Under Review"}
                {userApplication.status === 'approved' && "✅ Application Approved!"}
                {userApplication.status === 'rejected' && "❌ Application Declined"}
                {userApplication.status === 'cancelled' && "📁 Application Archived"}
              </div>
            )}
            

            {/* Trust Signals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--mid)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> Takes 3 minutes
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--mid)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> No commitment
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--mid)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> Rescuer notified immediately
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}