'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import './styles.css';

interface LegalSection { h: string; p: string }

export default function LegalPage() {
  const t = useTranslations('Legal');
  const privacySections = t.raw('privacySections') as LegalSection[];
  const termsSections = t.raw('termsSections') as LegalSection[];
  const [tab, setTab] = useState<'privacy' | 'terms'>('privacy');
  const sections = tab === 'privacy' ? privacySections : termsSections;

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">{t('tag')}</div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-sub">{t('lastUpdated')}</p>
        </div>
      </div>

      <div className="legal-tabs">
        <button className={`legal-tab ${tab === 'privacy' ? 'active' : ''}`} onClick={() => setTab('privacy')}>{t('privacyTab')}</button>
        <button className={`legal-tab ${tab === 'terms' ? 'active' : ''}`} onClick={() => setTab('terms')}>{t('termsTab')}</button>
      </div>

      <div className="legal-doc">
        {sections.map((s) => (
          <div key={s.h} className="legal-section">
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </div>
        ))}
        <div className="legal-contact-box">
          {t('haveQuestions')} <a href="/contact">{t('contactUs')}</a>
        </div>
      </div>
    </>
  );
}
