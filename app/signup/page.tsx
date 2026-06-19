'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUpUser } from '../actions/auth';
import './styles.css';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ first: '', last: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // This function validates the Step 2 inputs before moving to Step 3
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first) newErrors.first = 'First name is required';
    if (!formData.last) newErrors.last = 'Last name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email required';
    if (formData.password.length < 8) newErrors.password = 'Min 8 characters required';

    if (Object.keys(newErrors).length === 0) {
      nextStep(); // Only proceed if validation passes
    } else {
      setErrors(newErrors);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const result = await signUpUser(formData);

    if (result.error) {
      alert("Registration failed: " + result.error);
    } else {
      nextStep();
    }
    setLoading(false);
  };

  return (
    <div className="signup-layout">
      <div className="left-panel">
        <h1 className="right-title" style={{color: '#fff'}}>FurriHearts</h1>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          <h2 className="right-title">Create your account</h2>
          <p className="right-sub">Already have an account? <Link href="/login">Log in</Link></p>

          <div className="step-bar">
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: 'contents' }}>
                <div className={`step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                  <div className="step-dot">{step > s ? '✓' : s}</div>
                  <div className="step-label">{['Account', 'Security', 'Done'][s - 1]}</div>
                </div>
                {s < 3 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <div className="form-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div className="form-field">
                  <input className="form-input" placeholder="First Name" onChange={e => handleInputChange('first', e.target.value)} />
                  {errors.first && <div style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.first}</div>}
                </div>
                <div className="form-field">
                  <input className="form-input" placeholder="Last Name" onChange={e => handleInputChange('last', e.target.value)} />
                  {errors.last && <div style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.last}</div>}
                </div>
              </div>
              <input className="form-input" placeholder="Email" onChange={e => handleInputChange('email', e.target.value)} style={{marginBottom: '12px'}} />
              {errors.email && <div style={{color:'red', fontSize:'12px', marginTop:'-8px', marginBottom:'12px'}}>{errors.email}</div>}
              
              <input className="form-input" type="password" placeholder="Password" onChange={e => handleInputChange('password', e.target.value)} />
              {errors.password && <div style={{color:'red', fontSize:'12px', marginTop:'4px', marginBottom:'12px'}}>{errors.password}</div>}
              
              <button className="btn-continue" onClick={validateStep2}>Continue</button>
              <button className="btn-back" onClick={prevStep} style={{background:'transparent', border:'none', marginTop:'10px', width:'100%', cursor:'pointer'}}>← Back</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="captcha-box" onClick={() => setCaptchaVerified(true)} style={{border: captchaVerified ? '1.5px solid var(--green)' : '1.5px solid var(--border)'}}>
                {captchaVerified ? '✅ Verified' : 'Click to verify you are human'}
              </div>
              <button className="btn-continue" onClick={handleRegister} disabled={!captchaVerified || loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <button className="btn-back" onClick={prevStep} style={{background:'transparent', border:'none', marginTop:'10px', width:'100%', cursor:'pointer'}}>← Back</button>
            </div>
          )}

          {step === 3 && (
            <div style={{textAlign: 'center'}}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2>Welcome!</h2>
              <p>Your account is ready.</p>
              <Link href="/browse" className="btn-continue">Explore Pets</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}