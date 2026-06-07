'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './styles.css'; 

export default function AdoptionGuide() {
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
          <div className="guide-tag">Adoption Guide</div>
          <h1 className="guide-title">Your complete guide to <em>adopting a pet</em> 🐾</h1>
          <p className="guide-sub">Everything you need to know — from preparing your home to the first weeks with your new furry family member.</p>
        </div>
      </div>

      <div className="guide-layout">
        
        {/* Automatic Active Sidebar */}
        <aside className="guide-sidebar">
          <a href="#prepare" className={`sidebar-link ${activeSection === 'prepare' ? 'active' : ''}`}>Prepare Your Home</a>
          <a href="#first-days" className={`sidebar-link ${activeSection === 'first-days' ? 'active' : ''}`}>First Days at Home</a>
          <a href="#costs" className={`sidebar-link ${activeSection === 'costs' ? 'active' : ''}`}>Understanding Costs</a>
          <a href="#health" className={`sidebar-link ${activeSection === 'health' ? 'active' : ''}`}>Health & Vet Care</a>
          <div className="sidebar-div"></div>
          <Link href="/furrimatch" className="sidebar-link">✨ Take FurriMatch Quiz</Link>
          <Link href="/browse" className="sidebar-link">🐾 Browse Pets</Link>
        </aside>

        <main className="guide-main">
          
          <div className="guide-section" id="prepare">
            <div className="gs-tag">Step 1</div>
            <h2 className="gs-title">Prepare Your Home</h2>
            <p className="gs-intro">Before bringing your new pet home, make sure your space is safe, secure, and welcoming.</p>
            
            <div className="checklist">
              {[
                { title: 'Secure all windows and balconies', desc: 'Pets are curious explorers. Install mesh or grilles to prevent escapes or falls.' },
                { title: 'Set up a litter box or toilet area', desc: 'Cats need a litter box in a quiet spot. Dogs need a designated outdoor or pad area.' },
                { title: 'Prepare a quiet room for the first days', desc: 'A small, calm space helps your pet adjust without feeling overwhelmed.' },
                { title: 'Remove toxic plants and hazards', desc: 'Common toxic plants include lilies, pothos, and aloe vera. Secure loose wires too.' },
                { title: 'Stock up on essentials', desc: 'Food, water bowls, a carrier, toys, and a bed or resting spot.' },
                { title: 'Find a vet nearby', desc: 'Have a vet lined up before your pet arrives for peace of mind.' }
              ].map((item, index) => {
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
            <div className="gs-tag">Step 2</div>
            <h2 className="gs-title">The First Days at Home</h2>
            <p className="gs-intro">The first few days are crucial. Give your pet time and space to explore and adjust at their own pace.</p>
            <div className="phase-cards">
              <div className="phase-card"><div className="phase-num">1</div><div><h4>Day 1 — Arrive & Settle</h4><p>Let your pet explore one room first. Don't force interaction. Place food, water, and bedding in the room.</p><ul><li>Keep it quiet — no loud music or guests</li><li>Let them come to you, not the other way</li><li>Stay calm and speak in a soft, gentle voice</li></ul></div></div>
              <div className="phase-card"><div className="phase-num">2</div><div><h4>Days 2–7 — Build Trust</h4><p>Gradually introduce more of the home. Offer treats, gentle play, and consistent routines.</p><ul><li>Use a calm, reassuring tone</li><li>Play to build confidence and bonding</li><li>Establish regular feeding times</li></ul></div></div>
              <div className="phase-card"><div className="phase-num">3</div><div><h4>Week 2 onwards — Bloom</h4><p>Most pets begin to show their true personality after 2 weeks. This is when the magic happens! 🐾</p><ul><li>Introduce family members slowly</li><li>Book first vet visit if not done</li><li>Start a regular grooming routine</li></ul></div></div>
            </div>
          </div>

          <div className="guide-section" id="costs">
            <div className="gs-tag">Costs</div>
            <h2 className="gs-title">Understanding the Costs</h2>
            <p className="gs-intro">Pet ownership is a long-term commitment. Here's a realistic breakdown to help you plan.</p>
            <table className="cost-table">
              <thead><tr><th>Category</th><th>One-Time</th><th>Monthly</th></tr></thead>
              <tbody>
                <tr><td>Adoption Fee</td><td className="cost-range">RM80 – RM350</td><td>—</td></tr>
                <tr><td>Starter Supplies</td><td className="cost-range">RM150 – RM400</td><td>—</td></tr>
                <tr><td>Food</td><td>—</td><td className="cost-range">RM60 – RM200</td></tr>
                <tr><td>Litter / Hygiene</td><td>—</td><td className="cost-range">RM30 – RM60</td></tr>
                <tr><td>Vet & Vaccinations</td><td>—</td><td className="cost-range">RM30 – RM120</td></tr>
                <tr><td style={{fontWeight: 700}}>Estimated Total</td><td className="cost-range" style={{fontWeight: 700}}>RM230 – RM750</td><td className="cost-range" style={{fontWeight: 700}}>RM120 – RM380/mo</td></tr>
              </tbody>
            </table>
          </div>

          <div className="guide-section" id="health">
            <div className="gs-tag">Health & Care</div>
            <h2 className="gs-title">Keeping Your Pet Healthy</h2>
            <p className="gs-intro">Regular care keeps your pet happy and prevents costly health issues down the line.</p>
            <div className="tips-grid">
              <div className="tip-card"><div className="tip-icon">🩺</div><div><h4>Annual Vet Checkups</h4><p>Even healthy pets need a yearly wellness visit. Early detection saves lives and costs.</p></div></div>
              <div className="tip-card"><div className="tip-icon">💉</div><div><h4>Vaccinations</h4><p>Core vaccines vary by species. Keep boosters up to date as recommended by your vet.</p></div></div>
              <div className="tip-card"><div className="tip-icon">🐛</div><div><h4>Deworming & Flea Treatment</h4><p>Regular deworming every 3–6 months. Monthly flea and tick prevention recommended.</p></div></div>
              <div className="tip-card"><div className="tip-icon">✂️</div><div><h4>Spay / Neuter</h4><p>Prevents unwanted litters and reduces risk of certain cancers and behavioural issues.</p></div></div>
            </div>
          </div>

          <div className="cta-bar">
            <h3>Ready to find your perfect match? 🐾</h3>
            <p>Take our FurriMatch quiz or browse available pets near you.</p>
            <Link href="/furrimatch" className="btn-find">✨ Take FurriMatch Quiz</Link>
            &nbsp;&nbsp;
            <Link href="/browse" className="btn-find" style={{ background: '#fff', color: 'var(--orange)', border: '1.5px solid var(--orange)' }}>Adopt a Pet</Link>
          </div>

        </main>
      </div>
    </>
  );
}