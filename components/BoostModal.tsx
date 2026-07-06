'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
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

export default function BoostModal({
  petId,
  petName,
  triggerLabel = '⭐ Boost this listing',
  triggerClassName = 'btn-view-full',
}: {
  petId: string;
  petName: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'tier' | 'payment' | 'success'>('tier');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const tier = TIERS.find((t) => t.id === selectedTier);

  const close = () => {
    setOpen(false);
    setStep('tier');
    setSelectedTier(null);
    setReceiptFile(null);
    setError('');
  };

  const goToPayment = () => {
    if (!selectedTier) {
      setError('Please choose a boost tier.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handleSubmit = async () => {
    if (!tier) return;
    if (!receiptFile) {
      setError('Please upload your payment receipt.');
      return;
    }
    setSubmitting(true);
    setError('');

    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('boost-receipts').upload(fileName, receiptFile);
    if (uploadError) {
      setError('Could not upload receipt: ' + uploadError.message);
      setSubmitting(false);
      return;
    }

    // Receipts contain payment info, so they're kept private — store the storage
    // path (not a public URL); admins view them via a short-lived signed URL.
    const result = await requestBoost(petId, tier.id, tier.days, tier.price, fileName);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setStep('success');
  };

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>{triggerLabel}</button>

      {open && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="boost-modal-title">
            <div className="modal-header">
              <h2 id="boost-modal-title">{step === 'success' ? 'Boost requested' : `Boost ${petName}`}</h2>
              <button className="btn-close" onClick={close} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              {step === 'tier' && (
                <>
                  <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '16px' }}>
                    Choose a tier to feature {petName} on the homepage Featured Pets section. An admin reviews every request before it goes live.
                  </p>
                  <div className="tier-picker">
                    {TIERS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`tier-card ${selectedTier === t.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTier(t.id)}
                      >
                        <div className="tier-card-label">{t.label}</div>
                        <div className="tier-card-price">RM{t.price}</div>
                        <div className="tier-card-blurb">{t.blurb}</div>
                      </button>
                    ))}
                  </div>
                  {error && <div className="contact-error" style={{ marginTop: '12px' }}>{error}</div>}
                </>
              )}

              {step === 'payment' && tier && (
                <>
                  <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '12px' }}>
                    Scan the QR code below and transfer <strong>RM{tier.price}</strong> to pay for the {tier.label} boost. Then upload your payment receipt so an admin can verify it.
                  </p>
                  <img src="/boost-payment-qr.png" alt="Payment QR code" style={{ width: '180px', height: '180px', display: 'block', margin: '0 auto 16px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  <div className="form-field">
                    <label className="form-label" htmlFor="receipt">Payment Receipt</label>
                    <input
                      id="receipt"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="form-input"
                    />
                  </div>
                  {error && <div className="contact-error" style={{ marginTop: '8px' }}>{error}</div>}
                </>
              )}

              {step === 'success' && (
                <p style={{ color: 'var(--mid)' }}>Your boost request has been submitted for review. We'll feature {petName} on the homepage once an admin verifies your payment and approves it.</p>
              )}
            </div>
            <div className="modal-actions">
              {step === 'tier' && (
                <button className="btn-approve" onClick={goToPayment}>Continue to Payment</button>
              )}
              {step === 'payment' && (
                <button className="btn-approve" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Request Boost'}
                </button>
              )}
              {step === 'success' && (
                <button className="btn-approve" onClick={close}>Done</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
