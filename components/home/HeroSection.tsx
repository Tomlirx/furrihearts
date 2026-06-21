import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-tag">🐾 Malaysia's Pet Adoption Platform</div>
        <h1 className="hero-heading">Where every paw<br />finds <span>a home</span> 🤍</h1>
        <p className="hero-sub">FurriHearts connects loving adopters with rescued pets across Malaysia. Because every heart deserves a forever home.</p>
        <div className="hero-btns">
          <Link href="/browse" className="btn-hero-primary">🐾 Adopt a Pet</Link>
        </div>
      </div>
    </section>
  );
}
