'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import './styles.css';

interface ChecklistItem { title: string; desc: string }

export default function AdoptionGuide() {
  const t = useTranslations('Guide');
  const checklist = t.raw('checklist') as ChecklistItem[];
  const phase1Tips = t.raw('phase1Tips') as string[];
  const phase2Tips = t.raw('phase2Tips') as string[];
  const phase3Tips = t.raw('phase3Tips') as string[];

  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [activeSection, setActiveSection] = useState('prepare');

  // Interactive Checklist Toggle
  const toggleCheck = (index: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  // Automatic Scroll Spy for the Sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      // This margin triggers the active state when a section hits the top 30% of the screen
      { rootMargin: '-30% 0px -70% 0px' }
    );

    const sections = document.querySelectorAll('.guide-section');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <>
      {/* The Ribbon and Nav have been removed to let Layout handle them globally */}

      <div className="guide-hero">
        <div className="guide-hero-inner">
          <div className="guide-tag">{t('tag')}</div>
          <h1 className="guide-title">{t.rich('title', { em: (chunks) => <em>{chunks}</em> })}</h1>
          <p className="guide-sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="guide-layout">

        {/* Automatic Active Sidebar */}
        <aside className="guide-sidebar">
          <a href="#prepare" className={`sidebar-link ${activeSection === 'prepare' ? 'active' : ''}`}>{t('navPrepare')}</a>
          <a href="#first-days" className={`sidebar-link ${activeSection === 'first-days' ? 'active' : ''}`}>{t('navFirstDays')}</a>
          <a href="#costs" className={`sidebar-link ${activeSection === 'costs' ? 'active' : ''}`}>{t('navCosts')}</a>
          <a href="#health" className={`sidebar-link ${activeSection === 'health' ? 'active' : ''}`}>{t('navHealth')}</a>
          <div className="sidebar-div"></div>
          <Link href="/browse" className="sidebar-link">{t('navBrowse')}</Link>
        </aside>

        <main className="guide-main">

          <div className="guide-section" id="prepare">
            <div className="gs-tag">{t('step1')}</div>
            <h2 className="gs-title">{t('prepareTitle')}</h2>
            <p className="gs-intro">{t('prepareIntro')}</p>

            <div className="checklist">
              {checklist.map((item, index) => {
                const isChecked = checkedItems.has(index);
                return (
                  <div key={index} className={`check-item ${isChecked ? 'checked' : ''}`} onClick={() => toggleCheck(index)}>
                    <div className="check-box">{isChecked ? '✓' : ''}</div>
                    <div className="check-text">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="guide-section" id="first-days">
            <div className="gs-tag">{t('step2')}</div>
            <h2 className="gs-title">{t('firstDaysTitle')}</h2>
            <p className="gs-intro">{t('firstDaysIntro')}</p>
            <div className="phase-cards">
              <div className="phase-card"><div className="phase-num">1</div><div><h4>{t('phase1Title')}</h4><p>{t('phase1Desc')}</p><ul>{phase1Tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div></div>
              <div className="phase-card"><div className="phase-num">2</div><div><h4>{t('phase2Title')}</h4><p>{t('phase2Desc')}</p><ul>{phase2Tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div></div>
              <div className="phase-card"><div className="phase-num">3</div><div><h4>{t('phase3Title')}</h4><p>{t('phase3Desc')}</p><ul>{phase3Tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div></div>
            </div>
          </div>

          <div className="guide-section" id="costs">
            <div className="gs-tag">{t('costsTag')}</div>
            <h2 className="gs-title">{t('costsTitle')}</h2>
            <p className="gs-intro">{t('costsIntro')}</p>
            <table className="cost-table">
              <thead><tr><th>{t('costCategory')}</th><th>{t('costOneTime')}</th><th>{t('costMonthly')}</th></tr></thead>
              <tbody>
                <tr><td>{t('costAdoptionFee')}</td><td className="cost-range">RM80 – RM350</td><td>—</td></tr>
                <tr><td>{t('costStarterSupplies')}</td><td className="cost-range">RM150 – RM400</td><td>—</td></tr>
                <tr><td>{t('costFood')}</td><td>—</td><td className="cost-range">RM60 – RM200</td></tr>
                <tr><td>{t('costLitter')}</td><td>—</td><td className="cost-range">RM30 – RM60</td></tr>
                <tr><td>{t('costVet')}</td><td>—</td><td className="cost-range">RM30 – RM120</td></tr>
                <tr><td style={{fontWeight: 700}}>{t('costEstimatedTotal')}</td><td className="cost-range" style={{fontWeight: 700}}>RM230 – RM750</td><td className="cost-range" style={{fontWeight: 700}}>RM120 – RM380/mo</td></tr>
              </tbody>
            </table>
          </div>

          <div className="guide-section" id="health">
            <div className="gs-tag">{t('healthTag')}</div>
            <h2 className="gs-title">{t('healthTitle')}</h2>
            <p className="gs-intro">{t('healthIntro')}</p>
            <div className="tips-grid">
              <div className="tip-card"><div className="tip-icon">🩺</div><div><h4>{t('tip1Title')}</h4><p>{t('tip1Desc')}</p></div></div>
              <div className="tip-card"><div className="tip-icon">💉</div><div><h4>{t('tip2Title')}</h4><p>{t('tip2Desc')}</p></div></div>
              <div className="tip-card"><div className="tip-icon">🐛</div><div><h4>{t('tip3Title')}</h4><p>{t('tip3Desc')}</p></div></div>
              <div className="tip-card"><div className="tip-icon">✂️</div><div><h4>{t('tip4Title')}</h4><p>{t('tip4Desc')}</p></div></div>
            </div>
          </div>

          <div className="cta-bar">
            <h3>{t('ctaTitle')}</h3>
            <p>{t('ctaSub')}</p>
            <Link href="/browse" className="btn-find">{t('ctaBtn')}</Link>
          </div>

        </main>
      </div>
    </>
  );
}
