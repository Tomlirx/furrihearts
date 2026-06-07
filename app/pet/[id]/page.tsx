'use client';
import './styles.css';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';

export default function PetProfile() {
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    async function fetchPet() {
      if (!id) return;
      const { data, error } = await supabase
        .from('pets')
        .select('*, gallery, fee') 
        .eq('id', id)
        .single();
      
      if (error || !data) {
        notFound();
      } else {
        setPet(data);
        setMainImage(data.image_url);
      }
      setLoading(false);
    }
    fetchPet();
  }, [id]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;

  const photos = (pet.gallery && pet.gallery.length > 0) ? pet.gallery : [pet.image_url];
  const currentIndex = photos.indexOf(mainImage);

  return (
    <>
      <div className="top-bar" style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/browse" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mid)', fontSize: '14px', textDecoration: 'none' }}>← Back to Browse</Link>
      </div>

      <div className="profile-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 60px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '40px', alignItems: 'start' }}>
        
        {/* ================= LEFT COLUMN ================= */}
        <div>
          <div className="main-img" style={{ width: '100%', height: '420px', borderRadius: '16px', background: 'linear-gradient(135deg,#E8D5C4,#C9A88A)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '12px', overflow: 'hidden' }}>
            <img src={mainImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={pet.name} />
            
            {photos.length > 1 && (
              <>
                <button 
                  onClick={() => setMainImage(photos[(currentIndex - 1 + photos.length) % photos.length])}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                >‹</button>
                <button 
                  onClick={() => setMainImage(photos[(currentIndex + 1) % photos.length])}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                >›</button>
              </>
            )}

            <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>{pet.age}</span>
            {photos.length > 1 && (
              <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>{currentIndex + 1} / {photos.length}</span>
            )}
          </div>

          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {photos.map((url: string, index: number) => (
                <div 
                  key={index} 
                  onClick={() => setMainImage(url)}
                  style={{ width: '80px', height: '72px', borderRadius: '10px', cursor: 'pointer', border: mainImage === url ? '2px solid var(--orange)' : '2px solid transparent', overflow: 'hidden' }}
                >
                  <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', marginBottom: '20px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid var(--orange)', display: 'inline-block' }}>About {pet.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--light)', marginBottom: '10px' }}>{pet.gender} · {pet.age} · {pet.location}</div>
            
            <p style={{ color: 'var(--mid)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{pet.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Health & Medical</h4>
                <ul style={{ listStyle: 'none' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--mid)' }}>
                    <div style={{ width: '20px', height: '20px', background: 'var(--green-pale)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--green)' }}>✓</div> Vaccinated
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--mid)' }}>
                    <div style={{ width: '20px', height: '20px', background: 'var(--green-pale)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--green)' }}>✓</div> Dewormed
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Adoption Information</h4>
                <ul style={{ listStyle: 'none' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--mid)' }}>
                    <span style={{ color: 'var(--light)' }}>Adoption Fee</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>RM{pet.fee || '0'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--mid)' }}>
                    <span style={{ color: 'var(--light)' }}>Location</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{pet.location}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Interested in {pet.name}?</h4>

            {/* Rescuer Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#F0D5B8,#C9A88A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>👩</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Sheryl Ng</div>
                <div style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600 }}>✅ Verified Rescuer</div>
                <Link href="#" style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View Profile →</Link>
              </div>
            </div>

            {/* Stats Box */}
            <div style={{ display: 'flex', gap: '16px', padding: '12px', background: 'var(--cream)', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>128</div>
                <div style={{ fontSize: '11px', color: 'var(--light)' }}>Adoptions</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>3.5 yrs</div>
                <div style={{ fontSize: '11px', color: 'var(--light)' }}>Experience</div>
              </div>
            </div>

            {/* CTA Button */}
            <Link href={`/apply/${pet.id}`} style={{ display: 'block', background: 'var(--orange)', color: '#fff', borderRadius: '10px', padding: '14px', textAlign: 'center', fontSize: '15px', fontWeight: 700, textDecoration: 'none', marginBottom: '10px' }}>
              I'm Interested 🐾
            </Link>
            <div style={{ fontSize: '12px', color: 'var(--light)', textAlign: 'center', marginBottom: '16px' }}>⏱️ Usually replies within 1 day</div>

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