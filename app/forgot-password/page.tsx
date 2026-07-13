'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { recoveryClient } from '@/lib/supabase-recovery';
import { SITE_URL } from '@/lib/site';
import '../signup/styles.css';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPassword');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) {
      setError(t('invalidEmail'));
      return;
    }
    setLoading(true);
    // Sent via the implicit-flow recovery client (not the app's PKCE client) so
    // the reset link uses hash tokens and needs no code_verifier — the link
    // then works even when opened on a different device/browser. redirectTo is
    // the canonical site URL so the link host is correct regardless of origin.
    if (recoveryClient) {
      const { error: resetError } = await recoveryClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/reset-password`,
      });
      if (resetError) console.error('Password reset error:', resetError);
    }
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="signup-layout">
      <div className="left-panel" style={{ background: 'linear-gradient(135deg,#FBE8D8,#F5C9A0,#E8A87C)' }}>
        <h1 className="right-title" style={{ color: 'var(--dark)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--mid)', marginTop: '16px', maxWidth: '300px', textAlign: 'center' }}>{t('subtitle')}</p>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          {sent ? (
            <>
              <h2 className="right-title">{t('checkEmail')}</h2>
              <p className="right-sub">{t.rich('checkEmailDesc', { email, strong: (chunks) => <strong>{chunks}</strong> })}</p>
              <Link href="/login" className="btn-continue">{t('backToLogin')}</Link>
            </>
          ) : (
            <>
              <h2 className="right-title">{t('resetPassword')}</h2>
              <p className="right-sub">{t('rememberedIt')} <Link href="/login">{t('logIn')}</Link></p>

              <div className="form-field">
                <label className="form-label" htmlFor="email">{t('emailLabel')}</label>
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
                {loading ? t('sending') : t('sendResetLink')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
