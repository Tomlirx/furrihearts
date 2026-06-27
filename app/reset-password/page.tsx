'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import '../signup/styles.css';

export default function ResetPasswordPage() {
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
    // The browser client (@supabase/ssr, PKCE flow) handles the ?code= in
    // the URL entirely on its own as part of its construction-time
    // _initialize() — it detects the code, exchanges it using the stored
    // code_verifier, and fires a PASSWORD_RECOVERY event once done. Manually
    // calling exchangeCodeForSession() ourselves here would race against
    // that and fail (the verifier is single-use and already consumed by the
    // SDK's own internal exchange by the time a second, redundant call
    // runs) — so just listen for the event instead of re-doing the exchange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        resolved.current = true;
        setHasSession(true);
      }
    });

    // If a session already exists by the time this mounts (the SDK's
    // initializePromise may have resolved before this listener attached),
    // onAuthStateChange won't fire again — check directly as a fallback.
    supabase.auth.getSession().then(({ data }: any) => {
      if (!resolved.current && data?.session) {
        resolved.current = true;
        setHasSession(true);
      }
    });

    // No recovery session materialized within a reasonable window — either
    // there was no code at all, or the link is genuinely invalid/expired.
    const timeout = setTimeout(() => {
      if (!resolved.current) {
        resolved.current = true;
        setHasSession(false);
      }
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('passwordsDontMatch'));
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/dashboard'), 1500);
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
              <p className="right-sub">{t('redirecting')}</p>
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
