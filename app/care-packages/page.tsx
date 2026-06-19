import Link from 'next/link';
import './styles.css';

const PACKAGES = [
  { name: 'Starter Pack', tag: 'Popular', emoji: '🐱', items: ['Food (2kg)', 'Litter (5L)', 'Toy bundle', 'Feeding bowls'], price: 89, oldPrice: 119 },
  { name: 'Health Bundle', tag: 'Recommended', emoji: '💊', items: ['Deworming tablets', 'Flea treatment', 'Vitamin supplements'], price: 65, oldPrice: 85 },
  { name: 'Comfort Set', tag: 'New', emoji: '🛏️', items: ['Pet bed', 'Carrier bag', 'Grooming brush'], price: 110, oldPrice: 150 },
];

export default function CarePackagesPage() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">For New Adopters</div>
          <h1 className="page-title">Pet Care Packages 🎁</h1>
          <p className="page-sub">Everything your new pet needs, bundled and delivered across Malaysia.</p>
        </div>
      </div>

      <div className="trust-bar">
        <div className="trust-item"><span>🚚</span> Free delivery over RM100</div>
        <div className="trust-item"><span>✅</span> Vet-approved products</div>
        <div className="trust-item"><span>↩️</span> 7-day returns</div>
        <div className="trust-item"><span>🤝</span> Supports local rescues</div>
      </div>

      <div className="packages-grid">
        {PACKAGES.map((pkg) => (
          <div className="package-card" key={pkg.name}>
            <div className="package-img">
              <span className="package-badge">{pkg.tag}</span>
              <span className="package-emoji">{pkg.emoji}</span>
            </div>
            <div className="package-body">
              <h3>{pkg.name}</h3>
              <ul>{pkg.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <div className="package-price-row">
                <span className="price-now">RM{pkg.price}</span>
                <span className="price-old">RM{pkg.oldPrice}</span>
              </div>
              <Link href="/contact" className="btn-add-cart">Inquire to Order</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
