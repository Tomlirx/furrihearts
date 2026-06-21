import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-text">Furri<span>Hearts</span></div>
            <p>{t('tagline')}<br/>{t('trustedPlatform')}</p>
          </div>
          <div className="footer-col">
            <h4>{t('forAdopters')}</h4>
            <Link href="/browse">{t('adoptAPet')}</Link>
            <Link href="/guide">{t('adoptionGuide')}</Link>
            <Link href="/care-packages">{t('carePackages')}</Link>
          </div>
          <div className="footer-col">
            <h4>{t('forRescuers')}</h4>
            <NextLink href="/rescuer-listing">{t('listAPet')}</NextLink>
            <Link href="/rescuer-landing">{t('forRescuers')}</Link>
          </div>
          <div className="footer-col">
            <h4>{t('company')}</h4>
            <Link href="/about">{t('aboutUs')}</Link>
            <Link href="/contact">{t('contactUs')}</Link>
            <Link href="/legal">{t('privacyTerms')}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t('copyright')}</span>
          <span>{t('madeWith')}</span>
        </div>
      </div>
    </footer>
  );
}
