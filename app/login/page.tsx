'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInUser } from '../actions/auth';
import { supabase } from '@/lib/supabase'; // Import your Supabase client
import '../signup/styles.css';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
    if (formData.password.length < 8) newErrors.pwd = 'Password must be at least 8 characters';
    if (!captchaVerified) newErrors.captcha = 'Please complete the CAPTCHA';

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
      router.push('/browse');
      router.refresh();
    }
    setLoading(false);
  };

  // NEW: Google Auth Handler
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrors({ email: 'Google login failed: ' + error.message });
    }
  };

  return (
    <div className="signup-layout">
      <div className="left-panel" style={{background: 'linear-gradient(135deg,#FBE8D8,#F5C9A0,#E8A87C)'}}>
        <h1 className="right-title" style={{color: 'var(--dark)'}}>Welcome back to FurriHearts</h1>
        <p style={{ color: 'var(--mid)', marginTop: '16px', maxWidth: '300px', textAlign: 'center' }}>Continue your journey to finding a forever friend.</p>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          <h2 className="right-title">Log in</h2>
          <p className="right-sub">Don't have an account? <Link href="/signup">Sign up →</Link></p>

          <div className="form-field">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@email.com" onChange={e => handleInputChange('email', e.target.value)} />
            <div className="field-error">{errors.email}</div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" className={`form-input ${errors.pwd ? 'error' : ''}`} type="password" placeholder="Enter your password" onChange={e => handleInputChange('password', e.target.value)} />
            <div className="field-error">{errors.pwd}</div>
            <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>

          <div id="captcha" tabIndex={0} role="checkbox" aria-checked={captchaVerified} className={`captcha-box ${errors.captcha ? 'error' : ''}`} onClick={() => setCaptchaVerified(!captchaVerified)} style={{cursor: 'pointer', border: captchaVerified ? '1.5px solid var(--green)' : '1.5px solid var(--border)'}}>
            {captchaVerified ? '✅ You\'re not a robot' : 'I\'m not a robot'}
          </div>
          <div className="field-error">{errors.captcha}</div>

          <button className="btn-login" onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="divider">or continue with</div>
          
          {/* UPDATED: Added the onClick handler to your social button */}
          <button className="btn-social" onClick={handleGoogleSignIn}>
            🌐 Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}