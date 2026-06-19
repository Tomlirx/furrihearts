'use client';

import { useState } from 'react';
import './styles.css';

const TABS = {
  privacy: {
    label: 'Privacy Policy',
    sections: [
      { h: 'Information We Collect', p: 'We collect your name, email, phone number, and any details you provide when listing a pet or submitting an adoption application.' },
      { h: 'How We Use Your Information', p: 'We use your information to connect adopters with rescuers, send application updates, and improve the platform.' },
      { h: 'Sharing Your Information', p: 'We only share your contact details with the other party in an adoption (e.g. the rescuer or adopter) once an application is approved.' },
    ],
  },
  terms: {
    label: 'Terms of Service',
    sections: [
      { h: 'Using FurriHearts', p: 'FurriHearts is a free platform connecting pet rescuers and adopters in Malaysia. You must be 18+ to list or apply for a pet.' },
      { h: 'Listings', p: 'Rescuers are responsible for the accuracy of their listings. FurriHearts does not verify the health or temperament claims in any listing.' },
      { h: 'Conduct', p: 'Harassment, fraud, or misuse of contact information shared through the platform may result in account suspension.' },
    ],
  },
};

export default function LegalPage() {
  const [tab, setTab] = useState<'privacy' | 'terms'>('privacy');
  const active = TABS[tab];

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">Legal</div>
          <h1 className="page-title">Privacy & Terms</h1>
          <p className="page-sub">Last updated June 2026</p>
        </div>
      </div>

      <div className="legal-tabs">
        <button className={`legal-tab ${tab === 'privacy' ? 'active' : ''}`} onClick={() => setTab('privacy')}>Privacy Policy</button>
        <button className={`legal-tab ${tab === 'terms' ? 'active' : ''}`} onClick={() => setTab('terms')}>Terms of Service</button>
      </div>

      <div className="legal-doc">
        {active.sections.map((s) => (
          <div key={s.h} className="legal-section">
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </div>
        ))}
        <div className="legal-contact-box">
          Have questions? <a href="/contact">Contact us</a>
        </div>
      </div>
    </>
  );
}
