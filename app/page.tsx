import { fetchPets } from '@/lib/pet-service';
import Link from 'next/link';
import { HomeSearch } from '@/components/HomeSearch';

export default async function Home() {
  // Fetch pets from Supabase and grab the first 4 for the Featured section
  const allPets = await fetchPets();
  const featuredPets = allPets ? allPets.slice(0, 4) : [];

  return (
    <>
      {/* Ribbon */}
      <div style={{ background: 'var(--orange)', color: '#fff', textAlign: 'center', padding: '10px 20px', fontSize: '13px', fontWeight: 500, position: 'sticky', top: 0, zIndex: 200 }}>
        🐾 Malaysia's #1 Pet Adoption Platform &nbsp;·&nbsp; <Link href="/furrimatch" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>Take the FurriMatch Quiz →</Link>
      </div>

      <nav>
        <div className="nav-inner">
          <Link className="logo" href="/">
            <div className="logo-icon">🐾</div>
            <span className="logo-text">Furri<span>Hearts</span></span>
          </Link>
          <div className="nav-links">
            <Link href="/browse" className="active">Adopt a Pet</Link>
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

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-tag">🐾 Malaysia's Pet Adoption Platform</div>
          <h1 className="hero-heading">Where every paw<br />finds <span>a home</span> 🤍</h1>
          <p className="hero-sub">FurriHearts connects loving adopters with rescued pets across Malaysia. Because every heart deserves a forever home.</p>
          <div className="hero-btns">
            <Link href="/browse" className="btn-hero-primary">🐾 Adopt a Pet</Link>
            <Link href="/furrimatch" className="btn-hero-outline">✨ Take FurriMatch Quiz</Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SEARCH WIDGET */}
      <HomeSearch />

      {/* FEATURED PETS (Dynamic from Supabase) */}
      <section className="featured-section">
        <div className="featured-inner">
          <div className="section-header">
            <div>
              <div className="section-tag">Featured Pets</div>
              <h2 className="section-title">Find your <em>purrfect</em> match 🐾</h2>
            </div>
            <Link href="/browse" className="view-all-link">View all pets →</Link>
          </div>
          
          <div className="pets-grid">
            {featuredPets.map((pet, index) => (
              <Link href={`/pet/${pet.id}`} key={pet.id} className={`pet-card ${index === 0 ? 'sponsored' : ''}`}>
                <div className="pet-card-img" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                  <img src={pet.image_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                  {index === 0 && (
                    <span className="pet-sponsored-tag" style={{ position: 'absolute', top: '10px', left: '10px' }}>⭐ FEATURED</span>
                  )}
                </div>
                <div className="pet-card-info">
                  <div className="pet-card-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {pet.name}
                    <span style={{ color: 'var(--orange)', fontSize: '14px', fontWeight: 700 }}>→</span>
                  </div>
                  <div className="pet-card-meta">{pet.age} years old · {pet.breed}</div>
                  <div className="pet-card-tags">
                    <span className="pet-tag">Available</span>
                    <span className="pet-tag green">Vaccinated</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="features-inner">
          <div style={{ textAlign: 'center' }}>
            <div className="section-tag">Why FurriHearts</div>
            <h2 className="section-title" style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 700 }}>Built for <em>meaningful</em> adoptions</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card"><div className="feature-icon">✨</div><div className="feature-title">Smart Matching</div><p className="feature-desc">Our FurriMatch algorithm finds the right companion based on your lifestyle and home.</p></div>
            <div className="feature-card"><div className="feature-icon">🏅</div><div className="feature-title">Verified Rescuers</div><p className="feature-desc">Every rescuer is reviewed to ensure a safe and responsible adoption experience.</p></div>
            <div className="feature-card"><div className="feature-icon">❤️</div><div className="feature-title">Adoption Support</div><p className="feature-desc">From application to adoption day, we're here to guide you every step of the way.</p></div>
            <div className="feature-card"><div className="feature-icon">🌱</div><div className="feature-title">Make an Impact</div><p className="feature-desc">Every adoption gives a rescued pet a second chance at a happy, loving life.</p></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <div className="how-inner">
          <div className="section-tag">Adoption Guide</div>
          <h2 className="section-title" style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 700 }}>Simple steps to a <em>successful adoption</em></h2>
          <div className="how-steps">
            <div className="how-step"><div className="how-step-num">1</div><h3>Find Your Match</h3><p>Browse pets or take FurriMatch to find a companion that fits your lifestyle.</p></div>
            <div className="how-step"><div className="how-step-num">2</div><h3>Apply</h3><p>Submit a short questionnaire. Your profile is automatically included.</p></div>
            <div className="how-step"><div className="how-step-num">3</div><h3>Pending Approval</h3><p>The rescuer reviews your application and gets back to you.</p></div>
            <div className="how-step"><div className="how-step-num">4</div><h3>Connected</h3><p>Coordinate collection with your rescuer and welcome your new family member home!</p></div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="testimonials-inner">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div className="section-tag">What Adopters Say</div>
            <h2 className="section-title" style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 700 }}>Be the first to share your story 🐾</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>💬</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No reviews yet</div>
            <p style={{ fontSize: '14px', color: 'var(--light)', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.6 }}>We're just getting started. Once adoptions happen, happy adopters and rescuers will share their stories here.</p>
            <Link href="/browse" style={{ display: 'inline-block', background: 'var(--orange)', color: '#fff', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>Start Your Journey 🐾</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo-text">Furri<span>Hearts</span></div>
              <p style={{ color: '#A09080', fontSize: '13px', marginTop: '10px', lineHeight: 1.6 }}>Matching hearts. Creating forever homes.<br />Malaysia's trusted pet adoption platform.</p>
            </div>
            <div className="footer-col">
              <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '14px', color: '#D0C0B0' }}>For Adopters</h4>
              <Link href="/browse" style={{ display: 'block', color: '#A09080', fontSize: '13px', textDecoration: 'none', marginBottom: '8px' }}>Adopt a Pet</Link>
              <Link href="/furrimatch" style={{ display: 'block', color: '#A09080', fontSize: '13px', textDecoration: 'none', marginBottom: '8px' }}>FurriMatch</Link>
            </div>
          </div>
          <div className="footer-bottom" style={{ borderTop: '1px solid #2A1E14', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6A5A4A', fontSize: '12px' }}>
            <span>© 2026 FurriHearts. All rights reserved.</span>
            <span>Made with ❤️ for animals in Malaysia</span>
          </div>
        </div>
      </footer>
    </>
  );
}