import './styles.css';

export default function AboutPage() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">About Us</div>
          <h1 className="page-title">Matching hearts, <em>creating forever homes</em> 🐾</h1>
          <p className="page-sub">FurriHearts connects rescued animals across Malaysia with the people ready to love them.</p>
        </div>
      </div>

      <div className="stats-band">
        <div className="stats-band-inner">
          <div className="stat-block"><div className="stat-num">1,254</div><div className="stat-label">Animals Rescued</div></div>
          <div className="stat-block"><div className="stat-num">825</div><div className="stat-label">Successful Adoptions</div></div>
          <div className="stat-block"><div className="stat-num">320</div><div className="stat-label">Active Rescuers</div></div>
          <div className="stat-block" style={{ borderRight: 'none' }}><div className="stat-num">4.9</div><div className="stat-label">Community Rating</div></div>
        </div>
      </div>

      <div className="mission-section">
        <h2>Our Mission</h2>
        <p>We started FurriHearts because finding a rescued pet a loving home in Malaysia was harder than it should be. Independent rescuers were doing incredible work with no platform to reach the right adopters — so we built one.</p>
        <p>Today, FurriHearts gives every <span className="hl">rescuer</span> a free, simple way to list a pet, and every <span className="hl">adopter</span> a trustworthy place to find their new best friend.</p>
      </div>

      <div className="values-section">
        <div className="values-inner">
          <div className="value-card"><div className="value-icon">❤️</div><h3>Animal-first</h3><p>Every decision we make starts with what's best for the animal.</p></div>
          <div className="value-card"><div className="value-icon">🤝</div><h3>Trust & transparency</h3><p>Verified rescuers, honest listings, no hidden fees.</p></div>
          <div className="value-card"><div className="value-icon">🇲🇾</div><h3>Built for Malaysia</h3><p>Local breeds, local rescuers, local communities.</p></div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Want to help more animals find homes?</h2>
        <p>Whether you're adopting or rescuing, you're part of the mission.</p>
        <div className="cta-btns">
          <a href="/browse" className="btn-cta-white">Browse Pets</a>
          <a href="/rescuer-listing" className="btn-cta-outline">List a Pet</a>
        </div>
      </div>
    </>
  );
}
