'use client';

import { useState } from 'react';
import { sendMessage } from '@/app/actions/messages';
import { countWords, MAX_MESSAGE_WORDS } from '@/lib/messages-data';
import './MessageComposer.css';

export default function MessageComposer({
  recipientId,
  petId,
  applicationId,
  triggerLabel = 'Message Rescuer',
  triggerClassName = 'btn-message',
  onSent,
}: {
  recipientId: string;
  petId?: string;
  applicationId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  onSent?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const wordCount = countWords(content);
  const overLimit = wordCount > MAX_MESSAGE_WORDS;

  const handleSend = async () => {
    if (!content.trim() || overLimit) return;
    setSending(true);
    setError('');

    const formData = new FormData();
    formData.set('recipientId', recipientId);
    if (petId) formData.set('petId', petId);
    if (applicationId) formData.set('applicationId', applicationId);
    formData.set('content', content.trim());

    const result = await sendMessage(formData);
    setSending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    setSent(true);
    onSent?.();
  };

  const close = () => {
    setOpen(false);
    setContent('');
    setError('');
    setSent(false);
  };

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>{triggerLabel}</button>

      {open && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{sent ? 'Message Sent' : 'Send a Message'}</h2>
              <button className="btn-close" onClick={close}>×</button>
            </div>
            <div className="modal-body">
              {sent ? (
                <p style={{ color: 'var(--mid)' }}>Your message has been sent. You'll be notified when they reply.</p>
              ) : (
                <>
                  <textarea
                    className="form-input"
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Ask about availability, health history, meet-up arrangements..."
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '12px', color: overLimit ? '#DC2626' : 'var(--light)' }}>
                      {wordCount} / {MAX_MESSAGE_WORDS} words
                    </span>
                  </div>
                  {error && <div className="contact-error" style={{ marginTop: '8px' }}>{error}</div>}
                </>
              )}
            </div>
            <div className="modal-actions">
              {sent ? (
                <button className="btn-approve" onClick={close}>Done</button>
              ) : (
                <button className="btn-approve" onClick={handleSend} disabled={sending || !content.trim() || overLimit}>
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
