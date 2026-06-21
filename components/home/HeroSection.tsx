import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function HeroSection() {
  const t = useTranslations('HeroSection');

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-tag">{t('tag')}</div>
        <h1 className="hero-heading">{t('headingLine1')}<br />{t('headingLine2Prefix')}<span>{t('headingHome')}</span> {t('headingEmoji')}</h1>
        <p className="hero-sub">{t('subtitle')}</p>
        <div className="hero-btns">
          <Link href="/browse" className="btn-hero-primary">{t('cta')}</Link>
        </div>
      </div>
    </section>
  );
}
