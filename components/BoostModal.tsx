'use client';

import { useState } from 'react';
import { requestBoost } from '@/app/actions/boosts';

interface Tier {
  id: string;
  label: string;
  days: number;
  price: number;
  blurb: string;
}

const TIERS: Tier[] = [
  { id: 'basic', label: 'Basic', days: 7, price: 15, blurb: '7 days featured on the homepage' },
  { id: 'standard', label: 'Standard', days: 14, price: 30, blurb: '14 days featured on the homepage' },
  { id: 'premium', label: 'Premium', days: 30, price: 55, blurb: '30 days featured on the homepage' },
];

export default function BoostModal({ petId, petName }: { petId: string; petName: string }) {
  const [open, setOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const close = () => {
    setOpen(false);
    setSelectedTier(null);
    setError('');
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    const tier = TIERS.find((t) => t.id === selectedTier);
    if (!tier) {
      setError('Please choose a boost tier.');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await requestBoost(petId, tier.id, tier.days, tier.price);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <button type="button" className="btn-view-full" onClick={() => setOpen(true)}>⭐ Boost this listing</button>

      {open && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{submitted ? 'Boost requested' : `Boost ${petName}`}</h2>
              <button className="btn-close" onClick={close} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              {submitted ? (
                <p style={{ color: 'var(--mid)' }}>Your boost request has been submitted for review. We'll feature {petName} on the homepage once an admin approves it.</p>
              ) : (
                <>
                  <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '16px' }}>
                    Choose a tier to feature {petName} on the homepage Featured Pets section. An admin reviews every request before it goes live.
                  </p>
                  <div className="tier-picker">
                    {TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        className={`tier-card ${selectedTier === tier.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTier(tier.id)}
                      >
                        <div className="tier-card-label">{tier.label}</div>
                        <div className="tier-card-price">RM{tier.price}</div>
                        <div className="tier-card-blurb">{tier.blurb}</div>
                      </button>
                    ))}
                  </div>
                  {error && <div className="contact-error" style={{ marginTop: '12px' }}>{error}</div>}
                </>
              )}
            </div>
            <div className="modal-actions">
              {submitted ? (
                <button className="btn-approve" onClick={close}>Done</button>
              ) : (
                <button className="btn-approve" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Request Boost'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
