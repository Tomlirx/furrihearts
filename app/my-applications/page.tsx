'use client';
import '../dashboard/styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getLocalApplications, updateLocalApplicationStatus } from '@/lib/local-store';
import { getMyApplications } from '@/lib/profile-data';
import { withdrawApplication } from '@/app/actions/applications';
import { TERMINAL_APPLICATION_STATUSES } from '@/lib/messages-data';
import MessageComposer from '@/components/MessageComposer';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import DashboardTabs from '@/components/DashboardTabs';
import { useToast } from '@/lib/useToast';

const PAGE_SIZE = 20;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Declined' },
  { key: 'cancelled', label: 'Withdrawn' },
  { key: 'closed', label: 'Completed' },
];

export default function MyApplicationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [withdrawTarget, setWithdrawTarget] = useState<any>(null);
  const [page, setPage] = useState(1);
  const { toast, showToast } = useToast();

  useEffect(() => {
    async function load() {
      setApps(getLocalApplications());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login?next=/my-applications'); return; }
      const data = await getMyApplications(supabase, user.id);
      setApps(data);
      setLoading(false);
    }
    load();
  }, []);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    if (supabase.__isMock) {
      updateLocalApplicationStatus(withdrawTarget.id, 'cancelled');
      setApps((prev) => prev.map((a) => (a.id === withdrawTarget.id ? { ...a, status: 'cancelled' } : a)));
    } else {
      const result = await withdrawApplication(withdrawTarget.id);
      if (result?.error) {
        showToast(result.error, 'decline');
        setWithdrawTarget(null);
        return;
      }
      setApps((prev) => prev.map((a) => (a.id === withdrawTarget.id ? { ...a, status: 'cancelled' } : a)));
    }
    showToast('Application withdrawn', 'decline');
    setWithdrawTarget(null);
  };

  if (loading) return <div className="loading-state">Loading your applications...</div>;

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (key: string) => {
    setFilter(key);
    setPage(1);
  };

  return (
    <div className="dashboard-container">
      <DashboardTabs />
      <div className="dashboard-header">
        <div><h1>My Applications</h1><p>Track all your adoption applications and their current status.</p></div>
      </div>

      <div className="filter-tabs">
        {TABS.map((tab) => (
          <button key={tab.key} className={`filter-tab ${filter === tab.key ? 'active' : ''}`} onClick={() => handleFilterChange(tab.key)}>
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
        <>
        <div className="applications-feed">
          {paginated.map((app) => (
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
                  <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                    🎉 Congratulations! Your application has been approved. Reach out to the rescuer to arrange a meet-up — see your
                    {' '}<Link href={`/profile/${app.pets?.rescuer_id}`}>rescuer's profile</Link> for contact details.
                  </p>
                )}
                {app.status === 'rejected' && <p style={{ fontSize: '13px', color: 'var(--danger)' }}>This application was declined. You can apply again if the pet is still available.</p>}
                {app.status === 'cancelled' && <p style={{ fontSize: '13px', color: 'var(--mid)' }}>This application was withdrawn. You can apply again any time.</p>}
                {app.status === 'closed' && <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>🎉 This pet found its forever home with you!</p>}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link href={`/pet/${app.pet_id || app.pets?.id}`} className="btn-view-full" style={{ flex: 'none', padding: '8px 16px' }}>View Pet</Link>
                  {app.pets?.rescuer_id && app.pets.rescuer_id !== 'demo-rescuer' && !TERMINAL_APPLICATION_STATUSES.includes(app.status) && (
                    <MessageComposer
                      recipientId={app.pets.rescuer_id}
                      petId={app.pet_id || app.pets?.id}
                      applicationId={app.id}
                      triggerLabel="Message Rescuer"
                      triggerClassName="btn-view-full"
                    />
                  )}
                  {app.status === 'pending' && (
                    <button className="btn-view-full" style={{ flex: 'none', padding: '8px 16px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setWithdrawTarget(app)}>
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!withdrawTarget}
        icon="🐾"
        title={`Withdraw application for ${withdrawTarget?.pets?.name}?`}
        body="You can always apply again if you change your mind."
        confirmLabel="Withdraw"
        cancelLabel="Keep"
        danger
        onConfirm={confirmWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
