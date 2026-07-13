'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { recoveryClient } from '@/lib/supabase-recovery';
import '../signup/styles.css';

// Read an error out of either the query string or the URL hash. Supabase's
// verify endpoint reports failures (e.g. an expired/consumed link) via
// error/error_code/error_description in one of those two places.
function readUrlError(): string | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return q.get('error_code') || q.get('error') || h.get('error_code') || h.get('error');
}

function ResetPasswordInner() {
  const t = useTranslations('ResetPassword');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const router = useRouter();
  const resolved = useRef(false);

  useEffect(() => {
    if (!recoveryClient) { setHasSession(false); return; }

    // A verify failure (expired / already-used link) comes back as an error in
    // the URL — surface it directly instead of waiting for a session.
    if (readUrlError()) { resolved.current = true; setHasSession(false); return; }

    const resolve = (ok: boolean) => { if (!resolved.current) { resolved.current = true; setHasSession(ok); } };

    // The recovery client (implicit flow) parses the #access_token from the hash
    // on init and fires PASSWORD_RECOVERY / SIGNED_IN — no code_verifier needed.
    const { data: { subscription } } = recoveryClient.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) resolve(true);
    });

    // Fallback in case init resolved before the listener attached.
    recoveryClient.auth.getSession().then(({ data }) => {
      if (data?.session) resolve(true);
      else {
        // Give the in-URL hash a moment to be parsed, then decide. No token in
        // the URL at all → invalid link.
        setTimeout(() => {
          if (resolved.current) return;
          const hasToken = typeof window !== 'undefined' && window.location.hash.includes('access_token');
          if (!hasToken) resolve(false);
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (password.length < 8) { setError(t('passwordTooShort')); return; }
    if (password !== confirm) { setError(t('passwordsDontMatch')); return; }
    if (!recoveryClient) { setError(t('invalidLinkSubtitle')); return; }

    setLoading(true);
    const { error: updateError } = await recoveryClient.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }

    // Password changed. The recovery session is intentionally not persisted to
    // the app's cookie session, so send the user to log in fresh.
    setDone(true);
    setTimeout(() => router.push('/login'), 1600);
  };

  return (
    <div className="signup-layout">
      <div className="left-panel" style={{ background: 'linear-gradient(135deg,#FBE8D8,#F5C9A0,#E8A87C)' }}>
        <h1 className="right-title" style={{ color: 'var(--dark)' }}>{t('title')}</h1>
        <p style={{ color: 'var(--mid)', marginTop: '16px', maxWidth: '300px', textAlign: 'center' }}>{t('subtitle')}</p>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          {done ? (
            <>
              <h2 className="right-title">{t('passwordUpdated')}</h2>
              <p className="right-sub">{t('loginWithNewPassword')}</p>
            </>
          ) : hasSession === false ? (
            <>
              <h2 className="right-title">{t('invalidLinkTitle')}</h2>
              <p className="right-sub">{t('invalidLinkSubtitle')}</p>
              <Link href="/forgot-password" className="btn-continue" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', marginTop: '16px' }}>
                {t('requestNewLink')}
              </Link>
            </>
          ) : hasSession === null ? null : (
            <>
              <h2 className="right-title">{t('newPassword')}</h2>

              <div className="form-field">
                <label className="form-label" htmlFor="password">{t('newPasswordLabel')}</label>
                <input
                  id="password"
                  className={`form-input ${error ? 'error' : ''}`}
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="confirm">{t('confirmPasswordLabel')}</label>
                <input
                  id="confirm"
                  className={`form-input ${error ? 'error' : ''}`}
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                />
                <div className="field-error">{error}</div>
              </div>

              <button className="btn-continue" onClick={handleSubmit} disabled={loading}>
                {loading ? t('updating') : t('updatePassword')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
