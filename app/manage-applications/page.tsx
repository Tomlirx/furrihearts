'use client';
import '../dashboard/styles.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getLocalApplications, updateLocalApplicationStatus } from '@/lib/local-store';
import { getMyPets, getIncomingApplications } from '@/lib/profile-data';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Declined' },
  { key: 'cancelled', label: 'Withdrawn' },
];

export default function ManageApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      setApps(getLocalApplications());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const pets = await getMyPets(supabase, user.id);
      if (pets.length) {
        const incoming = await getIncomingApplications(supabase, pets.map((p: any) => p.id));
        if (incoming.length) setApps(incoming);
      }
      setLoading(false);
    }
    load();
  }, []);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleUpdateStatus = async (app: any, newStatus: 'approved' | 'rejected') => {
    setIsUpdating(true);
    updateLocalApplicationStatus(app.id, newStatus);
    setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a)));
    if (!supabase.__isMock) {
      await supabase.from('applications').update({ status: newStatus }).eq('id', app.id);
    }
    showToast(newStatus === 'approved' ? 'Application approved' : 'Application declined', newStatus === 'approved' ? 'success' : 'decline');
    setSelectedApp(null);
    setIsUpdating(false);
  };

  if (loading) return <div className="loading-state">Loading applications...</div>;

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div><h1>Applications ({apps.length})</h1><p>All applications across your listings.</p></div>
      </div>

      <div className="filter-tabs">
        {TABS.map((tab) => (
          <button key={tab.key} className={`filter-tab ${filter === tab.key ? 'active' : ''}`} onClick={() => setFilter(tab.key)}>
            {tab.label} ({tab.key === 'all' ? apps.length : apps.filter((a) => a.status === tab.key).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>No applications yet</h3>
          <p>When adopters apply for your pets, they will appear here.</p>
        </div>
      ) : (
        <div className="applications-feed">
          {filtered.map((app) => (
            <div className="application-card" key={app.id}>
              <div className="app-header">
                <img src={app.pets?.image_url} alt={app.pets?.name} className="app-pet-img" />
                <div className="app-meta">
                  <h3>{app.profiles?.first_name || 'Demo'} {app.profiles?.last_name || 'Adopter'} <span className={`status-badge ${app.status}`}>{app.status}</span></h3>
                  <p>Applied for <strong>{app.pets?.name}</strong></p>
                </div>
              </div>
              <div className="app-details">
                <div className="qa-block"><strong>Home Type:</strong> {app.q2 || 'N/A'}</div>
                <div className="qa-block"><strong>Time Alone:</strong> {app.q5 || 'N/A'}</div>
                <button className="btn-view-full" onClick={() => setSelectedApp(app)}>Review Full Application →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application for {selectedApp.pets?.name}</h2>
              <button className="btn-close" onClick={() => setSelectedApp(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="applicant-info"><strong>Applicant:</strong> {selectedApp.profiles?.first_name || 'Demo'} {selectedApp.profiles?.last_name || 'Adopter'}</div>
              <div className="qa-full"><span className="q-label">1. Why adopt?</span><p>{selectedApp.q1?.join(', ') || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">2. Home type</span><p>{selectedApp.q2 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">3. Windows/Balconies secured?</span><p>{selectedApp.q3 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">4. Other pets?</span><p>{selectedApp.q4 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">5. Hours left alone?</span><p>{selectedApp.q5 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">6. Household agreement?</span><p>{selectedApp.q6 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">7. Anything else?</span><p>{selectedApp.q7 || 'N/A'}</p></div>
            </div>
            <div className="modal-actions">
              {selectedApp.status === 'pending' ? (
                <>
                  <button className="btn-reject" onClick={() => handleUpdateStatus(selectedApp, 'rejected')} disabled={isUpdating}>Decline</button>
                  <button className="btn-approve" onClick={() => handleUpdateStatus(selectedApp, 'approved')} disabled={isUpdating}>Approve</button>
                </>
              ) : (
                <div className="status-notice">This application is <strong>{selectedApp.status}</strong>.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
