'use client';

import './styles.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getLocalApplications, getLocalListings, updateLocalApplicationStatus } from '@/lib/local-store';
import { localPets, type Pet } from '@/lib/pet-service';

type DashboardTab = 'my-applications' | 'inbox' | 'listings';

export default function UnifiedDashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Demo User');
  const [activeTab, setActiveTab] = useState<DashboardTab>('my-applications');
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [incomingApps, setIncomingApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      const localApplications = getLocalApplications();
      const localListings = getLocalListings();

      setMyApplications(localApplications);
      setIncomingApps(localApplications);
      setMyPets([...localListings, ...localPets.filter((pet) => pet.rescuer_id === 'demo-rescuer')]);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.first_name || user.email?.split('@')[0] || 'User');

      const { data: adopterApps } = await supabase
        .from('applications')
        .select('*, pets (id, name, image_url, species, gender, location)')
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (adopterApps?.length) setMyApplications(adopterApps);

      const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('rescuer_id', user.id)
        .order('created_at', { ascending: false });

      if (petsData?.length) {
        setMyPets(petsData);
        const myPetIds = petsData.map((pet: Pet) => pet.id);
        const { data: appsData } = await supabase
          .from('applications')
          .select('*, pets (id, name, image_url, rescuer_id), profiles:applicant_id (first_name, last_name)')
          .in('pet_id', myPetIds)
          .order('created_at', { ascending: false });

        if (appsData?.length) setIncomingApps(appsData);
      }

      setActiveTab(petsData?.length ? 'inbox' : 'my-applications');
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (appId: string, _petId: string, newStatus: 'approved' | 'rejected' | 'cancelled') => {
    setIsUpdating(true);
    const updatedLocal = updateLocalApplicationStatus(appId, newStatus);
    setIncomingApps((prev) => prev.map((app) => app.id === appId ? { ...app, status: newStatus } : app));
    setMyApplications((prev) => prev.map((app) => app.id === appId ? { ...app, status: newStatus } : app));

    if (!supabase.__isMock) {
      const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', appId);
      if (error) console.error('Update Error:', error);
    }

    if (!incomingApps.some((app) => app.id === appId)) {
      setIncomingApps(updatedLocal);
      setMyApplications(updatedLocal);
    }

    setSelectedApp(null);
    setIsUpdating(false);
  };

  const handleRevertAdoption = async (appId: string, petId: string) => {
    if (!confirm('Cancel this adoption and reopen the pet listing?')) return;
    await handleUpdateStatus(appId, petId, 'cancelled');
  };

  if (loading) return <div className="loading-state">Loading your dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {userName}</h1>
          <p>Manage applications, saved progress, and rescue listings.</p>
        </div>
        <Link href="/rescuer-listing" className="btn-add-pet">+ Add New Pet</Link>
      </header>

      <div className="tabs-nav">
        <button className={`tab-btn ${activeTab === 'my-applications' ? 'active' : ''}`} onClick={() => setActiveTab('my-applications')}>
          My Applications ({myApplications.length})
        </button>
        {myPets.length > 0 && (
          <>
            <button className={`tab-btn ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
              Inbox ({incomingApps.length})
            </button>
            <button className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
              My Listings ({myPets.length})
            </button>
          </>
        )}
      </div>

      {activeTab === 'my-applications' && (
        <div className="tab-content">
          {myApplications.length > 0 ? (
            <div className="applications-feed">
              {myApplications.map((app) => (
                <div key={app.id} className="application-card">
                  <div className="app-header">
                    <img src={app.pets?.image_url} alt={app.pets?.name} className="app-pet-img" />
                    <div className="app-meta">
                      <h3>Application for {app.pets?.name}</h3>
                      <p>Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                      <span className={`status-badge ${app.status}`}>{app.status}</span>
                    </div>
                  </div>
                  <div className="app-details" style={{ marginTop: '16px' }}>
                    {app.status === 'pending' && <p style={{ fontSize: '13px', color: 'var(--mid)' }}>The rescuer is currently reviewing your application.</p>}
                    {app.status === 'approved' && <p style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>Congratulations. The rescuer has approved your application.</p>}
                    {app.status === 'rejected' && <p style={{ fontSize: '13px', color: '#DC2626' }}>This application was declined.</p>}
                    {app.status === 'cancelled' && <p style={{ fontSize: '13px', color: 'var(--mid)' }}>This application was archived.</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">FH</div>
              <h3>No applications yet</h3>
              <p>When you apply to adopt a pet, you can track the status here.</p>
              <Link href="/browse" className="btn-add-pet" style={{ marginTop: '16px', display: 'inline-block' }}>Browse Pets</Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="tab-content">
          {incomingApps.length > 0 ? (
            <div className="applications-feed">
              {incomingApps.map((app) => (
                <div key={app.id} className="application-card">
                  <div className="app-header">
                    <img src={app.pets?.image_url} alt={app.pets?.name} className="app-pet-img" />
                    <div className="app-meta">
                      <h3>Application for {app.pets?.name}</h3>
                      <p>From: <strong>{app.profiles?.first_name || 'Demo'} {app.profiles?.last_name || 'Adopter'}</strong></p>
                      <span className={`status-badge ${app.status}`}>{app.status}</span>
                    </div>
                    <div className="app-date">{new Date(app.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="app-details">
                    <div className="qa-block"><strong>Home Type:</strong> {app.q2 || 'N/A'}</div>
                    <div className="qa-block"><strong>Time Alone:</strong> {app.q5 || 'N/A'}</div>
                    <button className="btn-view-full" onClick={() => setSelectedApp(app)}>
                      Review Full Application →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">FH</div>
              <h3>No applications yet</h3>
              <p>When adopters apply for your pets, they will appear here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="tab-content">
          {myPets.length > 0 ? (
            <div className="listings-grid">
              {myPets.map((pet) => (
                <div key={pet.id} className="listing-card">
                  <img src={pet.image_url} alt={pet.name} />
                  <div className="listing-info">
                    <div className="listing-title-row">
                      <h4>{pet.name}</h4>
                      <span className={`status-dot ${pet.status === 'available' ? 'green' : 'gray'}`}></span>
                    </div>
                    <p>{pet.species} • {pet.gender} • {pet.location}</p>
                    <div className="listing-actions">
                      <Link href={`/pet/${pet.id}`}>View Public</Link>
                      <Link href="/rescuer-listing">Add Another</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">FH</div>
              <h3>No pets listed</h3>
              <p>You haven't added any pets to the platform yet.</p>
              <Link href="/rescuer-listing" className="btn-add-pet" style={{ marginTop: '16px', display: 'inline-block' }}>Add Your First Pet</Link>
            </div>
          )}
        </div>
      )}

      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Application for {selectedApp.pets?.name}</h2>
              <button className="btn-close" onClick={() => setSelectedApp(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="applicant-info">
                <strong>Applicant:</strong> {selectedApp.profiles?.first_name || 'Demo'} {selectedApp.profiles?.last_name || 'Adopter'}
              </div>

              <div className="qa-full"><span className="q-label">1. Why adopt?</span><p>{selectedApp.q1?.join(', ') || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">2. Home type</span><p>{selectedApp.q2 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">3. Windows/Balconies secured?</span><p>{selectedApp.q3 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">4. Other pets?</span><p>{selectedApp.q4 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">5. Hours left alone?</span><p>{selectedApp.q5 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">6. Household agreement?</span><p>{selectedApp.q6 || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">7. Anything else to know?</span><p>{selectedApp.q7 || 'N/A'}</p></div>
            </div>

            <div className="modal-actions">
              {selectedApp.status === 'pending' && (
                <>
                  <button className="btn-approve" onClick={() => handleUpdateStatus(selectedApp.id, selectedApp.pet_id, 'approved')} disabled={isUpdating}>Approve</button>
                  <button className="btn-reject" onClick={() => handleUpdateStatus(selectedApp.id, selectedApp.pet_id, 'rejected')} disabled={isUpdating}>Decline</button>
                </>
              )}

              {selectedApp.status === 'approved' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div className="status-notice" style={{ color: '#10B981', fontWeight: 600 }}>Approved.</div>
                  <button className="btn-reject" onClick={() => handleRevertAdoption(selectedApp.id, selectedApp.pet_id)} disabled={isUpdating}>Cancel Adoption & Reopen</button>
                </div>
              )}

              {(selectedApp.status === 'rejected' || selectedApp.status === 'cancelled') && (
                <div className="status-notice">This application is <strong>{selectedApp.status}</strong> and archived.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
