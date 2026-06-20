interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  { icon: '✨', title: 'Curated Listings', description: 'Browse by what matters to you — type, location, and lifestyle fit.' },
  { icon: '🏅', title: 'Verified Rescuers', description: 'Every rescuer is reviewed to ensure a safe and responsible adoption experience.' },
  { icon: '❤️', title: 'Adoption Support', description: "From application to adoption day, we're here to guide you every step of the way." },
  { icon: '🌱', title: 'Make an Impact', description: 'Every adoption gives a rescued pet a second chance at a happy, loving life.' },
];

export function FeatureGrid() {
  return (
    <section className="features">
      <div className="features-inner">
        <div className="section-header-center">
          <div className="section-tag">Why FurriHearts</div>
          <h2 className="section-title">Built for <em>meaningful</em> adoptions</h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-title">{feature.title}</div>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
