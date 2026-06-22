'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateProfile } from '../../actions/profile';

export default function EditProfileForm({ profile, email }: { profile: any; email?: string }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError('');
    const result = await updateProfile(formData);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="edit-header">
        <h1>Edit My Profile</h1>
        <Link href="/profile" className="btn-public-view">Cancel</Link>
      </div>

      <form action={handleSubmit}>
        <div className="profile-section">
          <h2>Profile Photo & Name</h2>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">First Name</label>
              <input name="firstName" className="form-input" defaultValue={profile?.first_name || ''} required />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name</label>
              <input name="lastName" className="form-input" defaultValue={profile?.last_name || ''} required />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input name="phone" className="form-input" defaultValue={profile?.phone || ''} />
            </div>
            <div className="form-field">
              <label className="form-label">Location</label>
              <input name="location" className="form-input" defaultValue={profile?.location || ''} placeholder="e.g. Kuala Lumpur" />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>About Me <span className="optional-tag">(shown if you list a pet)</span></h2>
          <textarea name="bio" className="form-input" rows={4} defaultValue={profile?.bio || ''} placeholder="Tell adopters about your rescue work..." />
        </div>

        <div className="profile-section">
          <h2>Contact Visibility</h2>
          <p className="field-hint">When contact sharing is off, adopters can still apply through FurriHearts.</p>
          <label className="toggle-row"><input type="checkbox" name="showEmail" defaultChecked={profile?.show_email ?? true} /> Show Email</label>
          <label className="toggle-row"><input type="checkbox" name="showPhone" defaultChecked={profile?.show_phone ?? true} /> Show Phone</label>
          <label className="toggle-row"><input type="checkbox" name="showWhatsapp" defaultChecked={profile?.show_whatsapp ?? true} /> Show WhatsApp</label>
        </div>

        <div className="profile-section">
          <h2>Verification & Trust</h2>
          <div className="detail-row"><span>Email</span><span>✅ Verified</span></div>
        </div>

        <div className="profile-section">
          <h2>Contact Information</h2>
          <div className="form-field">
            <label className="form-label">Email (internal use only)</label>
            <input className="form-input" defaultValue={email} disabled />
          </div>
        </div>

        {error && <div className="contact-error" style={{ marginBottom: '12px' }}>{error}</div>}
        <button type="submit" className="btn-edit-profile" style={{ width: '100%', padding: '14px', fontSize: '15px' }} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
