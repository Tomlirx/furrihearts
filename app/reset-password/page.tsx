'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import '../signup/styles.css';

function ResetPasswordContent() {
  const t = useTranslations('ResetPassword');
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function establishSession() {
      // PKCE flow (the default for @supabase/ssr's browser client): the
      // recovery link carries ?code=... rather than a #access_token hash, so
      // it must be explicitly exchanged for a session — getSession() alone
      // never reads it.
      const code = searchParams.get('code');
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        setHasSession(!exchangeError && !!data?.session);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data?.session);
    }
    establishSession();
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
