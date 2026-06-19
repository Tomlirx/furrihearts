'use client';

import { useState } from 'react';
import { resolveReport } from '@/app/actions/admin';

export default function AdminReportsList({ reports }: { reports: any[] }) {
  const [rows, setRows] = useState(reports);

  const handleResolve = async (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
    await resolveReport(id);
  };

  if (rows.length === 0) {
    return <div className="empty-state"><div className="empty-icon">🚩</div><h3>No reports</h3><p>Reports filed by users will appear here.</p></div>;
  }

  return (
    <div className="applications-feed">
      {rows.map((r) => (
        <div className="application-card" key={r.id}>
          <div className="app-header">
            <div className="app-meta">
              <h3>{r.target_type} <span className={`status-badge ${r.status === 'open' ? 'pending' : 'approved'}`}>{r.status}</span></h3>
              <p>Reported by {r.profiles?.first_name || 'Anonymous'} · {new Date(r.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="app-details">
            <div className="qa-block"><strong>Reason:</strong> {r.reason}</div>
            {r.details && <div className="qa-block"><strong>Details:</strong> {r.details}</div>}
            <div className="qa-block"><strong>Target ID:</strong> {r.target_id}</div>
            {r.status === 'open' && <button className="admin-btn success" onClick={() => handleResolve(r.id)}>Mark Resolved</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
