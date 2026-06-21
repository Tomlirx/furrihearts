import './styles.css';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { getPlatformStats } from '@/lib/pet-service';

export default async function AboutPage() {
  const supabase = await createClient();
  const stats = await getPlatformStats(supabase);
  const hasStats = stats.animalsListed > 0;
  const t = await getTranslations('About');

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">{t('tag')}</div>
          <h1 className="page-title">{t.rich('title', { em: (chunks) => <em>{chunks}</em> })}</h1>
          <p className="page-sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="stats-band">
        <div className="stats-band-inner">
          {hasStats ? (
            <>
              <div className="stat-block"><div className="stat-num">{stats.animalsListed}</div><div className="stat-label">{t('animalsListed')}</div></div>
              <div className="stat-block"><div className="stat-num">{stats.successfulAdoptions}</div><div className="stat-label">{t('successfulAdoptions')}</div></div>
              <div className="stat-block" style={{ borderRight: 'none' }}><div className="stat-num">{stats.activeRescuers}</div><div className="stat-label">{t('activeRescuers')}</div></div>
            </>
          ) : (
            <div className="stat-block" style={{ borderRight: 'none' }}><div className="stat-num">🌱</div><div className="stat-label">{t('justStarting')}</div></div>
          )}
        </div>
      </div>

      <div className="mission-section">
        <h2>{t('missionTitle')}</h2>
        <p>{t('mission1')}</p>
        <p>{t.rich('mission2', {
          rescuer: (chunks) => <span className="hl">{chunks}</span>,
          adopter: (chunks) => <span className="hl">{chunks}</span>,
        })}</p>
      </div>

      <div className="values-section">
        <div className="values-inner">
          <div className="value-card"><div className="value-icon">❤️</div><h3>{t('value1Title')}</h3><p>{t('value1Desc')}</p></div>
          <div className="value-card"><div className="value-icon">🤝</div><h3>{t('value2Title')}</h3><p>{t('value2Desc')}</p></div>
          <div className="value-card"><div className="value-icon">🇲🇾</div><h3>{t('value3Title')}</h3><p>{t('value3Desc')}</p></div>
        </div>
      </div>

      <div className="cta-section">
        <h2>{t('ctaTitle')}</h2>
        <p>{t('ctaSub')}</p>
        <div className="cta-btns">
          <a href="/browse" className="btn-cta-white">{t('browsePets')}</a>
          <a href="/rescuer-listing" className="btn-cta-outline">{t('listAPet')}</a>
        </div>
      </div>
    </>
  );
}
