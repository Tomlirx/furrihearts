'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '../actions/auth';
import '../signup/styles.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    await requestPasswordReset(email, window.location.origin);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="signup-layout">
      <div className="left-panel" style={{ background: 'linear-gradient(135deg,#FBE8D8,#F5C9A0,#E8A87C)' }}>
        <h1 className="right-title" style={{ color: 'var(--dark)' }}>Forgot your password?</h1>
        <p style={{ color: 'var(--mid)', marginTop: '16px', maxWidth: '300px', textAlign: 'center' }}>No worries — we'll send you a link to reset it.</p>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          {sent ? (
            <>
              <h2 className="right-title">Check your email</h2>
              <p className="right-sub">If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.</p>
              <Link href="/login" className="btn-continue">Back to log in</Link>
            </>
          ) : (
            <>
              <h2 className="right-title">Reset password</h2>
              <p className="right-sub">Remembered it? <Link href="/login">Log in →</Link></p>

              <div className="form-field">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  className={`form-input ${error ? 'error' : ''}`}
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                />
                <div className="field-error">{error}</div>
              </div>

              <button className="btn-continue" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
