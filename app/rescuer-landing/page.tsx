'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { getPlatformStats, type PlatformStats } from '@/lib/pet-service';
import { BOOST_ENABLED } from '@/lib/feature-flags';
import './styles.css';

export default function RescuerLanding() {
  const t = useTranslations('RescuerLanding');
  const [activeTab, setActiveTab] = useState<'rescuer' | 'adopter'>('rescuer');
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    getPlatformStats(supabase).then(setStats);
  }, []);

  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <>
      {/* Hero Section */}
      <section className="rl-hero">
        <div className="rl-hero-inner">
          <div className="hero-tag">{t('heroTag')}</div>
          <h1 className="hero-title">{t.rich('heroTitle', { em })}</h1>
          <p className="hero-sub">
            {t('heroSub')}
          </p>
          <div className="hero-btns">
            <Link href="/rescuer-listing" className="btn-hero">{t('startListing')}</Link>
          </div>
          <div className="hero-stats">
            {stats && stats.activeRescuers > 0 ? (
              <>
                <div><div className="hero-stat-num">{stats.activeRescuers}</div><div className="hero-stat-label">{t('activeRescuers')}</div></div>
                <div><div className="hero-stat-num">{stats.successfulAdoptions}</div><div className="hero-stat-label">{t('successfulAdoptions')}</div></div>
              </>
            ) : (
              <>
                <div><div className="hero-stat-num">RM0</div><div className="hero-stat-label">{t('hiddenFees')}</div></div>
                <div><div className="hero-stat-num">🇲🇾</div><div className="hero-stat-label">{t('madeForMalaysia')}</div></div>
              </>
            )}
            <div><div className="hero-stat-num">Free</div><div className="hero-stat-label">{t('alwaysFree')}</div></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="rl-features">
        <div className="rl-features-inner">
          <div className="section-tag">{t('featuresTag')}</div>
          <h2 className="section-title">{t.rich('featuresTitle', { em })}</h2>
          <p className="section-sub">{t('featuresSub')}</p>

          <div className="rl-features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <div className="feature-title">{t('feature1Title')}</div>
              <p className="feature-desc">{t('feature1Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <div className="feature-title">{t('feature2Title')}</div>
              <p className="feature-desc">{t('feature2Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏅</div>
              <div className="feature-title">{t('feature3Title')}</div>
              <p className="feature-desc">{t('feature3Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-title">{t('feature4Title')}</div>
              <p className="feature-desc">{t('feature4Desc')}</p>
            </div>
            {BOOST_ENABLED && (
              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <div className="feature-title">{t('feature5Title')}</div>
                <p className="feature-desc">{t('feature5Desc')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how" id="how">
        <div className="how-inner">
          <div className="section-tag" style={{ textAlign: 'center' }}>{t('howItWorksTag')}</div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 40px' }}>
            <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '30px', padding: '4px', display: 'flex', gap: '4px' }}>
              <button onClick={() => setActiveTab('rescuer')} style={{ background: activeTab === 'rescuer' ? 'var(--orange)' : 'transparent', color: activeTab === 'rescuer' ? '#fff' : 'var(--mid)', border: 'none', borderRadius: '24px', padding: '10px 28px', fontSize: '14px', fontWeight: activeTab === 'rescuer' ? 700 : 500, cursor: 'pointer', transition: 'all .2s' }}>
                {t('forRescuersTab')}
              </button>
              <button onClick={() => setActiveTab('adopter')} style={{ background: activeTab === 'adopter' ? 'var(--orange)' : 'transparent', color: activeTab === 'adopter' ? '#fff' : 'var(--mid)', border: 'none', borderRadius: '24px', padding: '10px 28px', fontSize: '14px', fontWeight: activeTab === 'adopter' ? 700 : 500, cursor: 'pointer', transition: 'all .2s' }}>
                {t('forAdoptersTab')}
              </button>
            </div>
          </div>

          {activeTab === 'rescuer' && (
            <div id="steps-rescuer">
              <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-fraunces)', fontSize: '34px', fontWeight: 700, marginBottom: '40px' }}>
                {t.rich('rescuerStepsTitle', { em: (chunks) => <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>{chunks}</em> })}
              </h2>
              <div className="how-steps">
                <div className="how-step"><div className="how-step-num">1</div><h3>{t('rescuerStep1Title')}</h3><p>{t('rescuerStep1Desc')}</p></div>
                <div className="how-step"><div className="how-step-num">2</div><h3>{t('rescuerStep2Title')}</h3><p>{t('rescuerStep2Desc')}</p></div>
                <div className="how-step"><div className="how-step-num">3</div><h3>{t('rescuerStep3Title')}</h3><p>{t('rescuerStep3Desc')}</p></div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link href="/rescuer-listing" className="btn-hero">{t('startListingArrow')}</Link>
              </div>
            </div>
          )}

          {activeTab === 'adopter' && (
            <div id="steps-adopter">
              <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-fraunces)', fontSize: '34px', fontWeight: 700, marginBottom: '40px' }}>
                {t.rich('adopterStepsTitle', { em: (chunks) => <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>{chunks}</em> })}
              </h2>
              <div className="how-steps">
                <div className="how-step"><div className="how-step-num" style={{ background: 'var(--green)' }}>1</div><h3>{t('adopterStep1Title')}</h3><p>{t('adopterStep1Desc')}</p></div>
                <div className="how-step"><div className="how-step-num" style={{ background: 'var(--green)' }}>2</div><h3>{t('adopterStep2Title')}</h3><p>{t('adopterStep2Desc')}</p></div>
                <div className="how-step"><div className="how-step-num" style={{ background: 'var(--green)' }}>3</div><h3>{t('adopterStep3Title')}</h3><p>{t('adopterStep3Desc')}</p></div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link href="/browse" className="btn-hero" style={{ background: 'var(--green)' }}>{t('browsePets')}</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof">
        <div className="social-inner">
          <div className="section-tag">{t('storiesTag')}</div>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-fraunces)', fontSize: '36px', fontWeight: 700, textAlign: 'center' }}>
            {t.rich('storiesTitle', { em: (chunks) => <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>{chunks}</em> })}
          </h2>
          <div className="proof-grid">
            <div className="proof-card">
              <div className="proof-avatar">👩</div>
              <p className="proof-quote">{t('proofQuote1')}</p>
              <div className="proof-name">{t('proofName1')}</div>
              <div className="proof-role">{t('proofRole1')}</div>
            </div>
            {/* ... remaining cards ... */}
          </div>
        </div>
      </section>
    </>
  );
}
