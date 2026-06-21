'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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
          ) : (
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
