'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { submitContactMessage } from '@/app/actions/contact';

export default function ContactForm() {
  const t = useTranslations('ContactForm');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');
    const result = await submitContactMessage(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    else setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="contact-success">
        <div className="contact-success-icon">✅</div>
        <h3>{t('messageSent')}</h3>
        <p>{t('thanks')}</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="contact-form">
      <div className="form-field">
        <label className="form-label">{t('yourName')}</label>
        <input name="name" className="form-input" required />
      </div>
      <div className="form-field">
        <label className="form-label">{t('email')}</label>
        <input name="email" type="email" className="form-input" required />
      </div>
      <div className="form-field">
        <label className="form-label">{t('category')}</label>
        <select name="category" className="form-input">
          <option>{t('categoryGeneral')}</option>
          <option>{t('categoryReport')}</option>
          <option>{t('categoryAccount')}</option>
          <option>{t('categoryPartnership')}</option>
          <option>{t('categoryOther')}</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">{t('message')}</label>
        <textarea name="message" className="form-input" rows={5} required />
      </div>
      {error && <div className="contact-error">{error}</div>}
      <button type="submit" className="btn-contact-submit" disabled={loading}>
        {loading ? t('sending') : t('send')}
      </button>
    </form>
  );
}
