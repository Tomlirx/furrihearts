'use client';

import { useState } from 'react';
import ContactForm from './ContactForm';
import './styles.css';

const FAQS = [
  { q: 'How long does it take to hear back from a rescuer?', a: 'Most rescuers respond within 24 hours of you submitting an application.' },
  { q: 'Is listing a pet free?', a: 'Yes — listing a pet for adoption on FurriHearts is completely free.' },
  { q: 'How do I report a suspicious listing?', a: 'Use the Report button on the pet profile, or contact us using the form on this page.' },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">Get in touch</div>
          <h1 className="page-title">How can we <em>help?</em> 🐾</h1>
          <p className="page-sub">We usually respond within 2 business days.</p>
        </div>
      </div>

      <div className="contact-layout">
        <div className="contact-channels">
          <a href="mailto:hello@furrihearts.com" className="channel-card">
            <div className="channel-icon">✉️</div>
            <div><h4>Email</h4><p>hello@furrihearts.com</p></div>
          </a>
          <a href="tel:+60123456789" className="channel-card">
            <div className="channel-icon">📞</div>
            <div><h4>Phone</h4><p>+60 12 345 6789</p></div>
          </a>
          <a href="https://wa.me/60123456789" className="channel-card">
            <div className="channel-icon">💬</div>
            <div><h4>WhatsApp</h4><p>Chat with us</p></div>
          </a>
        </div>

        <div className="contact-form-card">
          <h2>Send us a message</h2>
          <p style={{ color: 'var(--light)', fontSize: '13px', marginBottom: '20px' }}>Fill in the form and we'll get back to you.</p>
          <ContactForm />
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        {FAQS.map((faq, i) => (
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
