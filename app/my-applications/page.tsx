'use client';
import '../dashboard/styles.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getLocalApplications, updateLocalApplicationStatus } from '@/lib/local-store';
import { getMyApplications } from '@/lib/profile-data';
import MessageComposer from '@/components/MessageComposer';
import MessagesPanel from '@/components/MessagesPanel';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Closed' },
  { key: 'cancelled', label: 'Withdrawn' },
];

export default function MyApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [withdrawTarget, setWithdrawTarget] = useState<any>(null);
  const [view, setView] = useState<'applications' | 'messages'>('applications');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setApps(getLocalApplications());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      const data = await getMyApplications(supabase, user.id);
      if (data.length) setApps(data);
      setLoading(false);
    }
    load();
  }, []);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    const updated = updateLocalApplicationStatus(withdrawTarget.id, 'cancelled');
    setApps((prev) => prev.map((a) => (a.id === withdrawTarget.id ? { ...a, status: 'cancelled' } : a)));
    if (!supabase.__isMock) {
      await supabase.from('applications').update({ status: 'cancelled' }).eq('id', withdrawTarget.id);
    }
    setWithdrawTarget(null);
  };

  if (loading) return <div className="loading-state">Loading your applications...</div>;

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div><h1>My Applications</h1><p>Track all your adoption applications and their current status.</p></div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${view === 'applications' ? 'active' : ''}`} onClick={() => setView('applications')}>Applications</button>
        <button className={`filter-tab ${view === 'messages' ? 'active' : ''}`} onClick={() => setView('messages')}>Messages</button>
      </div>

      {view === 'messages' ? (
        userId ? <MessagesPanel currentUserId={userId} /> : <p style={{ color: 'var(--light)', fontSize: '13px' }}>Log in to view your messages.</p>
      ) : (
      <>
      <div className="filter-tabs">
        {TABS.map((tab) => (
          <button key={tab.key} className={`filter-tab ${filter === tab.key ? 'active' : ''}`} onClick={() => setFilter(tab.key)}>
            {tab.label} ({tab.key === 'all' ? apps.length : apps.filter((a) => a.status === tab.key).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐱</div>
          <h3>No applications yet</h3>
          <p>You haven't applied for any pets yet. Browse pets looking for a loving home!</p>
          <Link href="/browse" className="btn-add-pet" style={{ marginTop: '16px', display: 'inline-block' }}>🐾 Browse Pets</Link>
        </div>
      ) : (
        <div className="applications-feed">
          {filtered.map((app) => (
            <div className="application-card" key={app.id}>
              <div className="app-header">
                <img src={app.pets?.image_url} alt={app.pets?.name} className="app-pet-img" />
                <div className="app-meta">
                  <h3>{app.pets?.name} <span className={`status-badge ${app.status}`}>{app.status}</span></h3>
                  <p>{app.pets?.species} · {app.pets?.gender} · {app.pets?.location}</p>
                </div>
              </div>
              <div className="app-details">
                {app.status === 'pending' && <p style={{ fontSize: '13px', color: 'var(--mid)' }}>The rescuer is currently reviewing your application.</p>}
                {app.status === 'approved' && (
                  <p style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>
                    🎉 Congratulations! Your application has been approved. Reach out to the rescuer to arrange a meet-up — see your
                    {' '}<Link href={`/profile/${app.pets?.rescuer_id}`}>rescuer's profile</Link> for contact details.
                  </p>
                )}
                {app.status === 'rejected' && <p style={{ fontSize: '13px', color: '#DC2626' }}>This application was declined.</p>}
                {app.status === 'cancelled' && <p style={{ fontSize: '13px', color: 'var(--mid)' }}>This application was withdrawn.</p>}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link href={`/pet/${app.pet_id || app.pets?.id}`} className="btn-view-full" style={{ flex: 'none', padding: '8px 16px' }}>View Pet</Link>
                  {app.pets?.rescuer_id && (
                    <MessageComposer
                      recipientId={app.pets.rescuer_id}
                      petId={app.pet_id || app.pets?.id}
                      applicationId={app.id}
                      triggerLabel="Message Rescuer"
                      triggerClassName="btn-view-full"
                    />
                  )}
                  {app.status === 'pending' && (
                    <button className="btn-view-full" style={{ flex: 'none', padding: '8px 16px', color: '#DC2626', borderColor: '#DC2626' }} onClick={() => setWithdrawTarget(app)}>
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      {withdrawTarget && (
        <div className="modal-overlay" onClick={() => setWithdrawTarget(null)}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐾</div>
            <h2 style={{ marginBottom: '8px' }}>Withdraw application for {withdrawTarget.pets?.name}?</h2>
            <p style={{ color: 'var(--mid)', fontSize: '13px', marginBottom: '20px' }}>You can always apply again if you change your mind.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-view-full" style={{ flex: 1 }} onClick={() => setWithdrawTarget(null)}>Keep</button>
              <button className="btn-reject" style={{ flex: 1 }} onClick={confirmWithdraw}>Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
