'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { signUpUser } from '../actions/auth';
import './styles.css';
import '../rescuer-listing/created/styles.css';

export default function Signup() {
  const t = useTranslations('Signup');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ first: '', last: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // This function validates the Step 2 inputs before moving to Step 3
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first) newErrors.first = t('firstNameRequired');
    if (!formData.last) newErrors.last = t('lastNameRequired');
    if (!formData.email.includes('@')) newErrors.email = t('validEmailRequired');
    if (formData.password.length < 8) newErrors.password = t('minCharsRequired');

    if (Object.keys(newErrors).length === 0) {
      nextStep(); // Only proceed if validation passes
    } else {
      setErrors(newErrors);
      const order = ['first', 'last', 'email', 'password'];
      const firstField = order.find((f) => newErrors[f]);
      if (firstField) document.getElementById(firstField)?.focus();
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setRegisterError('');
    const result = await signUpUser(formData);

    if (result.error) {
      setRegisterError(result.error);
    } else {
      nextStep();
    }
    setLoading(false);
  };

  return (
    <div className="signup-layout">
      <div className="left-panel">
        <h1 className="right-title" style={{color: '#fff'}}>{t('logoText')}</h1>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          <h2 className="right-title">{t('title')}</h2>
          <p className="right-sub">{t('haveAccount')} <Link href="/login">{t('logIn')}</Link></p>

          <div className="step-bar">
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: 'contents' }}>
                <div className={`step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                  <div className="step-dot">{step > s ? '✓' : s}</div>
                  <div className="step-label">{[t('stepAccount'), t('stepSecurity'), t('stepDone')][s - 1]}</div>
                </div>
                {s < 3 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <div className="form-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div className="form-field">
                  <input id="first" aria-label={t('firstName')} className="form-input" placeholder={t('firstName')} onChange={e => handleInputChange('first', e.target.value)} />
                  {errors.first && <div className="field-error">{errors.first}</div>}
                </div>
                <div className="form-field">
                  <input id="last" aria-label={t('lastName')} className="form-input" placeholder={t('lastName')} onChange={e => handleInputChange('last', e.target.value)} />
                  {errors.last && <div className="field-error">{errors.last}</div>}
                </div>
              </div>
              <input id="email" aria-label={t('email')} className="form-input" placeholder={t('email')} onChange={e => handleInputChange('email', e.target.value)} style={{marginBottom: '12px'}} />
              {errors.email && <div className="field-error" style={{marginTop:'-8px', marginBottom:'12px'}}>{errors.email}</div>}

              <input id="password" aria-label={t('password')} className="form-input" type="password" placeholder={t('password')} onChange={e => handleInputChange('password', e.target.value)} />
              {errors.password && <div className="field-error" style={{marginBottom:'12px'}}>{errors.password}</div>}

              <button className="btn-continue" onClick={validateStep2}>{t('continue')}</button>
              <button className="btn-back" onClick={prevStep} style={{background:'transparent', border:'none', marginTop:'10px', width:'100%', cursor:'pointer'}}>{t('back')}</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div tabIndex={0} role="checkbox" aria-checked={captchaVerified} className="captcha-box" onClick={() => setCaptchaVerified(true)} style={{border: captchaVerified ? '1.5px solid var(--green)' : '1.5px solid var(--border)'}}>
                {captchaVerified ? t('captchaVerified') : t('captchaUnverified')}
              </div>
              {registerError && <div className="field-error" style={{marginTop: '8px'}}>{registerError}</div>}
              <button className="btn-continue" onClick={handleRegister} disabled={!captchaVerified || loading}>
                {loading ? t('creating') : t('createAccount')}
              </button>
              <button className="btn-back" onClick={prevStep} style={{background:'transparent', border:'none', marginTop:'10px', width:'100%', cursor:'pointer'}}>{t('back')}</button>
            </div>
          )}

          {step === 3 && (
            <div style={{textAlign: 'center'}}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2>{t('welcome')}</h2>
              <p style={{ marginBottom: '24px' }}>{t('accountReady')}</p>
              <div className="whats-next" style={{ marginBottom: '20px' }}>
                <Link href="/browse" className="next-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span>🐱</span>
                  <div>
                    <strong>{t('wantToAdopt')}</strong>
                    <p>{t('wantToAdoptDesc')}</p>
                  </div>
                </Link>
                <Link href="/rescuer-listing" className="next-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span>🏅</span>
                  <div>
                    <strong>{t('wantToList')}</strong>
                    <p>{t('wantToListDesc')}</p>
                  </div>
                </Link>
              </div>
              <Link href="/browse" className="btn-continue">{t('explorePets')}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
