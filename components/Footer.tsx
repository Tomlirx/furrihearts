import { getTranslations } from 'next-intl/server';

// Server Component — getTranslations() resolves on the server, so the
// translated text ships in the rendered HTML only. No client payload at all,
// unlike Navbar (a Client Component that needs a NextIntlClientProvider).
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
            <a href="/browse">{t('adoptAPet')}</a>
            <a href="/guide">{t('adoptionGuide')}</a>
            <a href="/care-packages">{t('carePackages')}</a>
          </div>
          <div className="footer-col">
            <h4>{t('forRescuers')}</h4>
            <a href="/rescuer-listing">{t('listAPet')}</a>
            <a href="/rescuer-landing">{t('forRescuers')}</a>
          </div>
          <div className="footer-col">
            <h4>{t('company')}</h4>
            <a href="/about">{t('aboutUs')}</a>
            <a href="/contact">{t('contactUs')}</a>
            <a href="/legal">{t('privacyTerms')}</a>
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