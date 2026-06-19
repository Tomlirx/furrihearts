'use client';

import { useState } from 'react';
import { resolveContactMessage } from '@/app/actions/admin';

export default function AdminContactList({ messages }: { messages: any[] }) {
  const [rows, setRows] = useState(messages);

  const handleResolve = async (id: string) => {
    setRows((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'resolved' } : m)));
    await resolveContactMessage(id);
  };

  if (rows.length === 0) {
    return <div className="empty-state"><div className="empty-icon">✉️</div><h3>No messages</h3><p>Submissions from the Contact page will appear here.</p></div>;
  }

  return (
    <div className="applications-feed">
      {rows.map((m) => (
        <div className="application-card" key={m.id}>
          <div className="app-header">
            <div className="app-meta">
              <h3>{m.name} <span className={`status-badge ${m.status === 'open' ? 'pending' : 'approved'}`}>{m.status}</span></h3>
              <p>{m.email} · {m.category || 'General'} · {new Date(m.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="app-details">
            <div className="qa-block">{m.message}</div>
            {m.status === 'open' && <button className="admin-btn success" onClick={() => handleResolve(m.id)}>Mark Resolved</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
