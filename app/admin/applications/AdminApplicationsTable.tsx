'use client';

import { useState } from 'react';
import { updateApplicationStatus } from '@/app/actions/admin';

export default function AdminApplicationsTable({ apps }: { apps: any[] }) {
  const [rows, setRows] = useState(apps);
  const [selected, setSelected] = useState<any>(null);

  const handleStatusChange = async (appId: string, status: string) => {
    setRows((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    await updateApplicationStatus(appId, status);
  };

  return (
    <>
      <table className="admin-table">
        <thead>
          <tr><th>Applicant</th><th>Pet</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map((app) => (
            <tr key={app.id}>
              <td>{app.profiles?.first_name || '—'} {app.profiles?.last_name || ''}</td>
              <td>{app.pets?.name || '—'}</td>
              <td>
                <select className="admin-select" value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="cancelled">cancelled</option>
                  <option value="closed">closed</option>
                </select>
              </td>
              <td><button className="admin-btn" onClick={() => setSelected(app)}>View Q&A</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application for {selected.pets?.name}</h2>
              <button className="btn-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="qa-full"><span className="q-label">1. Why adopt?</span><p>{selected.q1?.join(', ') || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">2. Home type</span><p>{selected.q2 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">3. Pet experience?</span><p>{selected.q5 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">4. Windows/Balconies secured?</span><p>{selected.q3 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">5. Other pets?</span><p>{selected.q4 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">6. Household agreement?</span><p>{selected.q6 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">7. Anything else?</span><p>{selected.q7 || 'N/A'}</p></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
