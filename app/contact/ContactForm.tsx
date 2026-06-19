'use client';

import { useState } from 'react';
import { submitContactMessage } from '../actions/contact';

export default function ContactForm() {
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
        <h3>Message sent!</h3>
        <p>Thanks for reaching out — we usually reply within 2 business days.</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="contact-form">
      <div className="form-field">
        <label className="form-label">Your Name</label>
        <input name="name" className="form-input" required />
      </div>
      <div className="form-field">
        <label className="form-label">Email</label>
        <input name="email" type="email" className="form-input" required />
      </div>
      <div className="form-field">
        <label className="form-label">Category</label>
        <select name="category" className="form-input">
          <option>General Question</option>
          <option>Report a Listing</option>
          <option>Account Issue</option>
          <option>Partnership</option>
          <option>Other</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Message</label>
        <textarea name="message" className="form-input" rows={5} required />
      </div>
      {error && <div className="contact-error">{error}</div>}
      <button type="submit" className="btn-contact-submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
