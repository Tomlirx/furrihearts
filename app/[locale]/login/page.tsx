'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { signInUser } from '@/app/actions/auth';
import { supabase } from '@/lib/supabase'; // Import your Supabase client
import { safeNext } from '@/lib/safe-redirect';
import '../signup/styles.css';

function LoginForm() {
  const t = useTranslations('Login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.includes('@')) newErrors.email = t('invalidEmail');
    if (formData.password.length < 8) newErrors.pwd = t('passwordTooShort');
    if (!captchaVerified) newErrors.captcha = t('captchaRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = newErrors.email ? 'email' : newErrors.pwd ? 'password' : 'captcha';
      document.getElementById(firstField)?.focus();
      return;
    }

    setLoading(true);
    const result = await signInUser(formData);

    if (result.error) {
      setErrors({ email: result.error });
    } else {
      router.push(next || '/browse');
      router.refresh();
    }
    setLoading(false);
  };

  // NEW: Google Auth Handler
  const handleGoogleSignIn = async () => {
    const callbackUrl = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error) {
      setErrors({ email: t('googleLoginFailed', { message: error.message }) });
    }
  };

  return (
    <div className="signup-layout">
      <div className="left-panel" style={{background: 'linear-gradient(135deg,#FBE8D8,#F5C9A0,#E8A87C)'}}>
        <h1 className="right-title" style={{color: 'var(--dark)'}}>{t('welcomeBack')}</h1>
        <p style={{ color: 'var(--mid)', marginTop: '16px', maxWidth: '300px', textAlign: 'center' }}>{t('welcomeBackSub')}</p>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          <h2 className="right-title">{t('title')}</h2>
          <p className="right-sub">{t('noAccount')} <Link href="/signup">{t('signUp')}</Link></p>

          <div className="form-field">
            <label className="form-label" htmlFor="email">{t('emailLabel')}</label>
            <input id="email" className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@email.com" onChange={e => handleInputChange('email', e.target.value)} />
            <div className="field-error">{errors.email}</div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">{t('passwordLabel')}</label>
            <input id="password" className={`form-input ${errors.pwd ? 'error' : ''}`} type="password" placeholder="Enter your password" onChange={e => handleInputChange('password', e.target.value)} />
            <div className="field-error">{errors.pwd}</div>
            <Link href="/forgot-password" className="forgot-link">{t('forgotPassword')}</Link>
          </div>

          <div id="captcha" tabIndex={0} role="checkbox" aria-checked={captchaVerified} className={`captcha-box ${errors.captcha ? 'error' : ''}`} onClick={() => setCaptchaVerified(!captchaVerified)} style={{cursor: 'pointer', border: captchaVerified ? '1.5px solid var(--green)' : '1.5px solid var(--border)'}}>
            {captchaVerified ? t('captchaVerified') : t('captchaUnverified')}
          </div>
          <div className="field-error">{errors.captcha}</div>

          <button className="btn-login" onClick={handleLogin} disabled={loading}>
            {loading ? t('loggingIn') : t('logIn')}
          </button>

          <div className="divider">{t('orContinueWith')}</div>

          {/* UPDATED: Added the onClick handler to your social button */}
          <button className="btn-social" onClick={handleGoogleSignIn}>
            {t('continueWithGoogle')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
