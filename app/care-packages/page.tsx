import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import './styles.css';

const PRICES = [
  { emoji: '🐱', price: 89, oldPrice: 119 },
  { emoji: '💊', price: 65, oldPrice: 85 },
  { emoji: '🛏️', price: 110, oldPrice: 150 },
];

interface PackageData { name: string; tag: string; items: string[] }

export default async function CarePackagesPage() {
  const t = await getTranslations('CarePackages');
  const packages = t.raw('packages') as PackageData[];

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">{t('tag')}</div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="trust-bar">
        <div className="trust-item"><span>🚚</span> {t('freeDelivery')}</div>
        <div className="trust-item"><span>✅</span> {t('vetApproved')}</div>
        <div className="trust-item"><span>↩️</span> {t('returns')}</div>
        <div className="trust-item"><span>🤝</span> {t('supportsRescues')}</div>
      </div>

      <div className="packages-grid">
        {packages.map((pkg, i) => (
          <div className="package-card" key={pkg.name}>
            <div className="package-img">
              <span className="package-badge">{pkg.tag}</span>
              <span className="package-emoji">{PRICES[i].emoji}</span>
            </div>
            <div className="package-body">
              <h3>{pkg.name}</h3>
              <ul>{pkg.items.map((item) => <li key={item}>{item}</li>)}</ul>
              <div className="package-price-row">
                <span className="price-now">RM{PRICES[i].price}</span>
                <span className="price-old">RM{PRICES[i].oldPrice}</span>
              </div>
              <Link href="/contact" className="btn-add-cart">{t('inquireToOrder')}</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
