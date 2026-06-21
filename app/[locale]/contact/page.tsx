'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ContactForm from './ContactForm';
import './styles.css';

export default function ContactPage() {
  const t = useTranslations('Contact');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
  ];

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">{t('tag')}</div>
          <h1 className="page-title">{t.rich('title', { em: (chunks) => <em>{chunks}</em> })}</h1>
          <p className="page-sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="contact-layout">
        <div className="contact-channels">
          <a href="mailto:hello@furrihearts.com" className="channel-card">
            <div className="channel-icon">✉️</div>
            <div><h4>{t('email')}</h4><p>hello@furrihearts.com</p></div>
          </a>
          <a href="tel:+60123456789" className="channel-card">
            <div className="channel-icon">📞</div>
            <div><h4>{t('phone')}</h4><p>+60 12 345 6789</p></div>
          </a>
          <a href="https://wa.me/60123456789" className="channel-card">
            <div className="channel-icon">💬</div>
            <div><h4>{t('whatsapp')}</h4><p>{t('chatWithUs')}</p></div>
          </a>
        </div>

        <div className="contact-form-card">
          <h2>{t('sendMessage')}</h2>
          <p style={{ color: 'var(--light)', fontSize: '13px', marginBottom: '20px' }}>{t('formIntro')}</p>
          <ContactForm />
        </div>
      </div>

      <div className="faq-section">
        <h2>{t('faqTitle')}</h2>
        {faqs.map((faq, i) => (
          <div key={i} className="faq-item">
            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {faq.q}
              <span className={`faq-arrow ${openFaq === i ? 'open' : ''}`}>▾</span>
            </button>
            {openFaq === i && <div className="faq-a">{faq.a}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
