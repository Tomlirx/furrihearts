import { useTranslations } from 'next-intl';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

export function FeatureGrid() {
  const t = useTranslations('FeatureGrid');
  const features = t.raw('items') as Feature[];

  return (
    <section className="features">
      <div className="features-inner">
        <div className="section-header-center">
          <div className="section-tag">{t('tag')}</div>
          <h2 className="section-title">{t.rich('title', { em: (chunks) => <em>{chunks}</em> })}</h2>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
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
