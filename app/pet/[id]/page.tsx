import { fetchPetById } from '@/lib/pet-service';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function PetProfile({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const pet = await fetchPetById(resolvedParams.id);

  if (!pet) notFound();

  return (
    <>
      <div style={{ background: 'var(--orange)', color: '#fff', textAlign: 'center', padding: '10px 20px', fontSize: '13px', fontWeight: 500 }}>
        🐾 Malaysia's #1 Pet Adoption Platform &nbsp;·&nbsp; 
        <Link href="/furrimatch" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>Take the FurriMatch Quiz →</Link>
      </div>

      <nav>
        <div className="nav-inner">
          <Link className="logo" href="/">
            <div className="logo-icon">🐾</div>
            <span className="logo-text">Furri<span>Hearts</span></span>
          </Link>
          <div className="nav-links">
            <Link href="/" className="active">Adopt a Pet</Link>
            <Link href="/furrimatch">FurriMatch</Link>
            <Link href="/guide">Adoption Guide</Link>
            <Link href="/rescuer-landing">For Rescuers</Link>
          </div>
          <div className="nav-right">
            <Link href="/rescuer-listing" style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 22px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>List Now</Link>
            <Link href="/login" className="btn-primary-nav">Log in</Link>
          </div>
        </div>
      </nav>

      <div className="top-bar">
        <Link href="/" className="back-link">← Back to Browse</Link>
        <div className="top-actions">
          <button className="top-action-btn">🔗 Share</button>
          <button className="top-action-btn" style={{ color: '#DC2626', borderColor: '#FECACA' }}>⚑ Report</button>
        </div>
      </div>

      <div className="profile-layout">
        <div>
          <div className="main-img" style={{ padding: 0, overflow: 'hidden', background: '#E8D5C4', display: 'block' }}>
            <img src={pet.image_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <span className="age-label" style={{ position: 'absolute', top: '12px', left: '12px' }}>{pet.age} years</span>
          </div>

          <div className="thumbnails">
            <div className="thumb active" style={{ padding: 0, overflow: 'hidden' }}>
              <img src={pet.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
          </div>

          <div className="section-card">
            <h2>About {pet.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--light)', marginBottom: '10px' }}>
              {pet.breed} · Kuala Lumpur
            </div>
            
            <div className="trait-pills" style={{ marginBottom: '16px' }}>
              <span className="trait-pill">Vaccinated</span>
              <span className="trait-pill">Available</span>
            </div>
            
            <p style={{ color: 'var(--mid)', fontSize: '14px', lineHeight: 1.7, marginBottom: '10px' }}>
              {pet.description || `${pet.name} is a wonderful ${pet.breed} looking for a forever home. Reach out to the rescuer to learn more about their personality and needs.`}
            </p>

            <div className="about-grid" style={{ marginTop: '24px' }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Health & Medical</h4>
                <ul className="health-list">
                  <li><div className="check-icon">✓</div> Vaccinated</li>
                  <li><div className="check-icon">✓</div> Dewormed</li>
                  <li><div className="check-icon">✓</div> Flea Treated</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Adoption Information</h4>
                <ul className="health-list">
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--light)' }}>Adoption Fee</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>RM150</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--light)' }}>Location</span>
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>Kuala Lumpur</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="right-sidebar">
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Interested in {pet.name}?</h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#F0D5B8,#C9A88A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                👩
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>FurriHearts Rescuer</div>
                <div style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600 }}>✅ Verified Rescuer</div>
              </div>
            </div>

            <Link href="#" style={{ display: 'block', background: 'var(--orange)', color: '#fff', borderRadius: '10px', padding: '14px', textAlign: 'center', fontSize: '15px', fontWeight: 700, textDecoration: 'none', marginBottom: '10px' }}>
              I'm Interested 🐾
            </Link>
            <div style={{ fontSize: '12px', color: 'var(--light)', textAlign: 'center', marginBottom: '16px' }}>
              ⏱️ Usually replies within 1 day
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--mid)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> Takes 3 minutes
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--mid)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> No commitment
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-bottom">
            <span>© 2026 FurriHearts. All rights reserved.</span>
            <span>Made with ❤️ for animals in Malaysia</span>
          </div>
        </div>
      </footer>
    </>
  );
}