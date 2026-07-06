'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getInbox, getSentMessages, getThread, groupThreads, markThreadRead, getLatestApplicationStatus, TERMINAL_APPLICATION_STATUSES } from '@/lib/messages-data';
import MessageComposer from './MessageComposer';
import Pagination from './Pagination';

const PAGE_SIZE = 20;

export default function MessagesPanel({ currentUserId }: { currentUserId: string }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [threadClosed, setThreadClosed] = useState(false);
  const [page, setPage] = useState(1);
  const lastDeepLink = useRef<string | null>(null);

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
    setThreadClosed(false);
    const [msgs, appStatus] = await Promise.all([
      getThread(supabase, currentUserId, thread.otherId, thread.petId),
      getLatestApplicationStatus(supabase, thread.petId, currentUserId, thread.otherId),
    ]);
    setThreadMessages(msgs);
    setThreadClosed(appStatus !== null && TERMINAL_APPLICATION_STATUSES.includes(appStatus));
    await markThreadRead(supabase, currentUserId, thread.otherId, thread.petId);
    window.dispatchEvent(new Event('furrihearts:messages-read'));
  };

  // Deep link from the navbar notification dropdown: /messages?with=<otherId>[&pet=<petId>].
  // Each distinct link auto-opens its thread once, so "Back to Messages" isn't overridden.
  useEffect(() => {
    if (loading) return;
    const withId = searchParams.get('with');
    if (!withId) return;
    const petId = searchParams.get('pet');
    const signature = `${withId}|${petId ?? ''}`;
    if (lastDeepLink.current === signature) return;
    lastDeepLink.current = signature;
    const match = threads.find(t => t.otherId === withId && (t.petId ?? '') === (petId ?? ''));
    if (match) openThread(match);
  }, [loading, threads, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="loading-state">Loading messages...</div>;

  if (activeThread) {
    // One-way system notices (listing/boost decisions) — or a self-addressed
    // notice when the reviewer is also the rescuer — are not repliable.
    const isSystemThread = Boolean(activeThread.latest?.is_system) || activeThread.otherId === currentUserId;
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
        {isSystemThread ? (
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--mid)' }}>
            This is a system notification and can't be replied to.
          </div>
        ) : threadClosed ? (
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--mid)' }}>
            This conversation is closed — the application is no longer active.
          </div>
        ) : (
          <MessageComposer
            recipientId={activeThread.otherId}
            petId={activeThread.petId}
            triggerLabel="Reply"
            triggerClassName="btn-message"
            onSent={() => { openThread(activeThread); loadThreads(); }}
          />
        )}
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

  const totalPages = Math.max(1, Math.ceil(threads.length / PAGE_SIZE));
  const paginated = threads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="applications-feed">
        {paginated.map((thread) => {
          const isUnread = thread.latest.read_at === null && thread.latest.recipient_id === currentUserId;
          return (
            <div key={`${thread.otherId}-${thread.petId}`} className="application-card" style={{ cursor: 'pointer' }} onClick={() => openThread(thread)}>
              <div className="app-header">
                <img src={thread.petImage} alt={thread.petName} className="app-pet-img" />
                <div className="app-meta">
                  <h3>
                    {isUnread && <span style={{ width: 8, height: 8, marginRight: 8, display: 'inline-block', borderRadius: '50%', background: 'var(--orange)' }} aria-hidden="true" />}
                    {thread.otherName} <span style={{ fontSize: '12px', color: 'var(--light)', fontWeight: 400 }}>· {thread.petName}</span>
                  </h3>
                  <p style={{ marginBottom: 0, fontWeight: isUnread ? 600 : 400 }}>{thread.latest.content.slice(0, 80)}{thread.latest.content.length > 80 ? '…' : ''}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
