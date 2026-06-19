'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getInbox, getSentMessages, getThread, groupThreads } from '@/lib/messages-data';
import MessageComposer from './MessageComposer';

export default function MessagesPanel({ currentUserId }: { currentUserId: string }) {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);

  const loadThreads = async () => {
    const [inbox, sent] = await Promise.all([
      getInbox(supabase, currentUserId),
      getSentMessages(supabase, currentUserId),
    ]);
    setThreads(groupThreads([...inbox, ...sent], currentUserId));
    setLoading(false);
  };

  useEffect(() => { loadThreads(); }, [currentUserId]);

  const openThread = async (thread: any) => {
    setActiveThread(thread);
    const msgs = await getThread(supabase, currentUserId, thread.otherId, thread.petId);
    setThreadMessages(msgs);
  };

  if (loading) return <div className="loading-state">Loading messages...</div>;

  if (activeThread) {
    return (
      <div className="section-card">
        <div className="section-card-header">
          <h3>{activeThread.otherName} · {activeThread.petName}</h3>
          <button onClick={() => setActiveThread(null)} style={{ background: 'none', border: 'none', color: 'var(--orange)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>← Back to Messages</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {threadMessages.map((m) => (
            <div key={m.id} style={{
              alignSelf: m.sender_id === currentUserId ? 'flex-end' : 'flex-start',
              background: m.sender_id === currentUserId ? 'var(--orange-pale)' : 'var(--cream)',
              borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '13px',
            }}>
              {m.content}
              <div style={{ fontSize: '10px', color: 'var(--light)', marginTop: '4px' }}>{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <MessageComposer
          recipientId={activeThread.otherId}
          petId={activeThread.petId}
          triggerLabel="Reply"
          triggerClassName="btn-message"
          onSent={() => { openThread(activeThread); loadThreads(); }}
        />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💬</div>
        <h3>No messages yet</h3>
        <p>Conversations about pets and applications will show up here.</p>
      </div>
    );
  }

  return (
    <div className="applications-feed">
      {threads.map((thread) => (
        <div key={`${thread.otherId}-${thread.petId}`} className="application-card" style={{ cursor: 'pointer' }} onClick={() => openThread(thread)}>
          <div className="app-header">
            <img src={thread.petImage} alt={thread.petName} className="app-pet-img" />
            <div className="app-meta">
              <h3>{thread.otherName} <span style={{ fontSize: '12px', color: 'var(--light)', fontWeight: 400 }}>· {thread.petName}</span></h3>
              <p style={{ marginBottom: 0 }}>{thread.latest.content.slice(0, 80)}{thread.latest.content.length > 80 ? '…' : ''}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
