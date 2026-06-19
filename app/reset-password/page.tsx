'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import '../signup/styles.css';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
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
        <h1 className="right-title" style={{ color: 'var(--dark)' }}>Set a new password</h1>
        <p style={{ color: 'var(--mid)', marginTop: '16px', maxWidth: '300px', textAlign: 'center' }}>Almost there — choose a strong new password.</p>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          {done ? (
            <>
              <h2 className="right-title">Password updated</h2>
              <p className="right-sub">Redirecting you to your dashboard...</p>
            </>
          ) : (
            <>
              <h2 className="right-title">New password</h2>

              <div className="form-field">
                <label className="form-label" htmlFor="password">New Password</label>
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
                <label className="form-label" htmlFor="confirm">Confirm Password</label>
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
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
