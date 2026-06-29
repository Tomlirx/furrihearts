'use client';
import '../dashboard/styles.css';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getLocalApplications, updateLocalApplicationStatus } from '@/lib/local-store';
import { getMyPets, getIncomingApplications } from '@/lib/profile-data';
import { closeApplication } from '@/app/actions/applications';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import DashboardTabs from '@/components/DashboardTabs';

const PAGE_SIZE = 20;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Declined' },
  { key: 'cancelled', label: 'Withdrawn' },
  { key: 'closed', label: 'Completed' },
];

function ManageApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petFilter = searchParams.get('pet');

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [declineTarget, setDeclineTarget] = useState<any>(null);
  const [closeTarget, setCloseTarget] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setApps(getLocalApplications());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login?next=/manage-applications'); return; }
      const pets = await getMyPets(supabase, user.id);
      const incoming = pets.length ? await getIncomingApplications(supabase, pets.map((p: any) => p.id)) : [];
      setApps(incoming);
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

  const confirmDecline = () => {
    if (!declineTarget) return;
    handleUpdateStatus(declineTarget, 'rejected');
    setDeclineTarget(null);
  };

  const confirmClose = async () => {
    if (!closeTarget) return;
    setIsUpdating(true);
    const result = await closeApplication(closeTarget.id);
    setIsUpdating(false);
    setCloseTarget(null);
    setSelectedApp(null);
    if (result?.error) {
      showToast(result.error, 'decline');
      return;
    }
    setApps((prev) => prev.map((a) => (
      a.id === closeTarget.id
        ? { ...a, status: 'closed' }
        : a.pet_id === closeTarget.pet_id && a.status === 'pending'
          ? { ...a, status: 'rejected' }
          : a
    )));
    showToast('Application closed — pet marked as adopted', 'success');
  };

  if (loading) return <div className="loading-state">Loading applications...</div>;

  const petScoped = petFilter ? apps.filter((a) => a.pet_id === petFilter) : apps;
  const filtered = filter === 'all' ? petScoped : petScoped.filter((a) => a.status === filter);
  const petName = petFilter ? petScoped[0]?.pets?.name : null;
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
        <div>
          <h1>{petFilter ? `Applications for ${petName || 'this pet'}` : `Applications (${apps.length})`}</h1>
          <p>{petFilter ? <a href="/manage-applications" style={{ color: 'var(--orange)' }}>← View all applications</a> : 'All applications across your listings.'}</p>
        </div>
      </div>

      <div className="filter-tabs">
        {TABS.map((tab) => (
          <button key={tab.key} className={`filter-tab ${filter === tab.key ? 'active' : ''}`} onClick={() => handleFilterChange(tab.key)}>
            {tab.label} ({tab.key === 'all' ? petScoped.length : petScoped.filter((a) => a.status === tab.key).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>No applications yet</h3>
          <p>{petFilter ? 'No one has applied for this pet yet.' : "When adopters apply for your pets, they will appear here."}</p>
        </div>
      ) : (
        <>
        <div className="applications-feed">
          {paginated.map((app) => (
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
                <div className="qa-block"><strong>Pet Experience:</strong> {app.q5 || 'N/A'}</div>
                <button className="btn-view-full" onClick={() => setSelectedApp(app)}>Review Full Application →</button>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application for {selectedApp.pets?.name}</h2>
              <button className="btn-close" onClick={() => setSelectedApp(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div className="applicant-info"><strong>Applicant:</strong> {selectedApp.profiles?.first_name || 'Demo'} {selectedApp.profiles?.last_name || 'Adopter'}</div>
              <div className="qa-full"><span className="q-label">1. Why adopt?</span><p>{selectedApp.q1?.join(', ') || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">2. Home type</span><p>{selectedApp.q2 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">3. Pet experience?</span><p>{selectedApp.q5 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">4. Windows/Balconies secured?</span><p>{selectedApp.q3 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">5. Other pets?</span><p>{selectedApp.q4 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">6. Household agreement?</span><p>{selectedApp.q6 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">7. Anything else?</span><p>{selectedApp.q7 || 'N/A'}</p></div>
            </div>
            <div className="modal-actions">
              {selectedApp.status === 'pending' ? (
                <>
                  <button className="btn-reject" onClick={() => setDeclineTarget(selectedApp)} disabled={isUpdating}>Decline</button>
                  <button className="btn-approve" onClick={() => handleUpdateStatus(selectedApp, 'approved')} disabled={isUpdating}>Approve</button>
                </>
              ) : selectedApp.status === 'approved' ? (
                <button className="btn-approve" onClick={() => setCloseTarget(selectedApp)} disabled={isUpdating}>Mark as Adopted</button>
              ) : (
                <div className="status-notice">This application is <strong>{selectedApp.status}</strong>.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!declineTarget}
        icon="🚫"
        title={`Decline this application?`}
        body={`${declineTarget?.profiles?.first_name || 'The applicant'} will be notified that their application for ${declineTarget?.pets?.name || 'this pet'} was declined.`}
        confirmLabel="Decline"
        cancelLabel="Keep reviewing"
        danger
        onConfirm={confirmDecline}
        onCancel={() => setDeclineTarget(null)}
      />

      <ConfirmDialog
        open={!!closeTarget}
        icon="🎉"
        title={`Mark this adoption as complete?`}
        body={`${closeTarget?.pets?.name || 'This pet'} will be marked adopted, and any other pending applicants for this pet will be automatically declined. This can't be undone.`}
        confirmLabel="Mark as Adopted"
        cancelLabel="Cancel"
        onConfirm={confirmClose}
        onCancel={() => setCloseTarget(null)}
      />

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default function ManageApplicationsPage() {
  return (
    <Suspense fallback={<div className="loading-state">Loading applications...</div>}>
      <ManageApplicationsContent />
    </Suspense>
  );
}
