'use client';

import './styles.css';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function UnifiedDashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'my-applications' | 'inbox' | 'listings'>('my-applications');

  // Data States
  const [myApplications, setMyApplications] = useState<any[]>([]); // For Adopters
  const [myPets, setMyPets] = useState<any[]>([]); // For Rescuers
  const [incomingApps, setIncomingApps] = useState<any[]>([]); // For Rescuers

  // Modal States
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile & Role
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserName(profile.first_name);
        setUserRole(profile.role || 'adopter');
        
        // Set default tab based on role
        if (profile.role === 'rescuer') setActiveTab('inbox');
        else setActiveTab('my-applications');
      }

      const role = profile?.role || 'adopter';

      // 2. Fetch Data for Adopters (or 'both')
      if (role === 'adopter' || role === 'both') {
        const { data: adopterApps } = await supabase
          .from('applications')
          .select(`*, pets (id, name, image_url)`)
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false });
        
        if (adopterApps) setMyApplications(adopterApps);
      }

      // 3. Fetch Data for Rescuers (or 'both')
      if (role === 'rescuer' || role === 'both') {
        const { data: petsData } = await supabase
          .from('pets')
          .select('*')
          .eq('rescuer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (petsData) {
          setMyPets(petsData);

          if (petsData.length > 0) {
            const myPetIds = petsData.map(pet => pet.id);
            const { data: appsData } = await supabase
              .from('applications')
              .select(`
                *,
                pets (name, image_url, rescuer_id),
                profiles:applicant_id (first_name, last_name)
              `)
              .in('pet_id', myPetIds)
              .order('created_at', { ascending: false });

            if (appsData) setIncomingApps(appsData);
          }
        }
      }

      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  // --- Actions ---
  const handleUpdateStatus = async (appId: string, petId: string, newStatus: 'approved' | 'rejected' | 'cancelled') => {
    setIsUpdating(true);
    const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', appId);

    if (!error) {
      setIncomingApps(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      setSelectedApp(null);
    } else {
      console.error("Update Error:", error);
      alert("Error updating status.");
    }
    setIsUpdating(false);
  };

  const handleRevertAdoption = async (appId: string, petId: string) => {
    if (!confirm("Are you sure you want to cancel this adoption and reopen the pet listing?")) return;
    setIsUpdating(true);

    const { error: appError } = await supabase.from('applications').update({ status: 'cancelled' }).eq('id', appId);
    const { error: petError } = await supabase.from('pets').update({ status: 'available' }).eq('id', petId);

    if (!appError && !petError) {
      setIncomingApps(prev => prev.map(app => app.id === appId ? { ...app, status: 'cancelled' } : app));
      setSelectedApp(null);
    } else {
      alert("Error reverting adoption.");
    }
    setIsUpdating(false);
  };

  if (loading) return <div className="loading-state">Loading your dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {userName || 'User'}</h1>
          <p>Manage your adoption journey.</p>
        </div>
        {(userRole === 'rescuer' || userRole === 'both') && (
          <Link href="/rescuer-listing" className="btn-add-pet">+ Add New Pet</Link>
        )}
      </header>

      {/* DYNAMIC TABS BASED ON ROLE */}
      <div className="tabs-nav">
        {(userRole === 'adopter' || userRole === 'both') && (
          <button className={`tab-btn ${activeTab === 'my-applications' ? 'active' : ''}`} onClick={() => setActiveTab('my-applications')}>
            My Applications ({myApplications.length})
          </button>
        )}
        
        {(userRole === 'rescuer' || userRole === 'both') && (
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

      {/* =========================================
          TAB: ADOPTER'S APPLICATIONS
      ========================================= */}
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
                    {app.status === 'pending' && <p style={{ fontSize: '13px', color: 'var(--mid)' }}>⏱️ The rescuer is currently reviewing your application.</p>}
                    {app.status === 'approved' && <p style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>🎉 Congratulations! The rescuer has approved your application.</p>}
                    {app.status === 'rejected' && <p style={{ fontSize: '13px', color: '#DC2626' }}>❌ Unfortunately, this application was declined.</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No applications yet</h3>
              <p>When you apply to adopt a pet, you can track the status here.</p>
              <Link href="/browse" className="btn-add-pet" style={{ marginTop: '16px', display: 'inline-block' }}>Browse Pets</Link>
            </div>
          )}
        </div>
      )}

      {/* =========================================
          TAB: RESCUER INBOX
      ========================================= */}
      {activeTab === 'inbox' && (
        <div className="tab-content">
          {incomingApps.length > 0 ? (
            <div className="applications-feed">
              {incomingApps.map((app) => (
                <div key={app.id} className="application-card">
                  <div className="app-header">
                    <img src={app.pets.image_url} alt={app.pets.name} className="app-pet-img" />
                    <div className="app-meta">
                      <h3>Application for {app.pets.name}</h3>
                      <p>From: <strong>{app.profiles?.first_name} {app.profiles?.last_name || ''}</strong></p>
                      <span className={`status-badge ${app.status}`}>{app.status}</span>
                    </div>
                    <div className="app-date">{new Date(app.created_at).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="app-details">
                    <div className="qa-block"><strong>Home Type:</strong> {app.q2}</div>
                    <div className="qa-block"><strong>Experience:</strong> {app.q5}</div>
                    <button className="btn-view-full" onClick={() => setSelectedApp(app)}>
                      Review Full Application →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="empty-state">
              <div className="empty-icon">📫</div>
              <h3>No applications yet</h3>
              <p>When adopters apply for your pets, they will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================
          TAB: RESCUER LISTINGS
      ========================================= */}
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
                    <p>{pet.species} • {pet.gender}</p>
                    <div className="listing-actions">
                      <Link href={`/pet/${pet.id}`}>View Public</Link>
                      <button className="text-btn">Edit</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🐾</div>
              <h3>No pets listed</h3>
              <p>You haven't added any pets to the platform yet.</p>
              <Link href="/rescuer-listing" className="btn-add-pet" style={{ marginTop: '16px', display: 'inline-block' }}>Add Your First Pet</Link>
            </div>
          )}
        </div>
      )}

      {/* =========================================
          THE REVIEW MODAL (Rescuer Only)
      ========================================= */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2>Application for {selectedApp.pets.name}</h2>
              <button className="btn-close" onClick={() => setSelectedApp(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="applicant-info">
                <strong>Applicant:</strong> {selectedApp.profiles?.first_name} {selectedApp.profiles?.last_name || ''}
              </div>

              <div className="qa-full"><span className="q-label">1. Describe your home:</span><p>{selectedApp.q1?.join(', ') || 'N/A'}</p></div>
              <div className="qa-full"><span className="q-label">2. Rent or Own?</span><p>{selectedApp.q2}</p></div>
              <div className="qa-full"><span className="q-label">3. Windows/Balconies secured?</span><p>{selectedApp.q3}</p></div>
              <div className="qa-full"><span className="q-label">4. Other pets?</span><p>{selectedApp.q4}</p></div>
              <div className="qa-full"><span className="q-label">5. Hours left alone?</span><p>{selectedApp.q5}</p></div>
              <div className="qa-full"><span className="q-label">6. Household agreement?</span><p>{selectedApp.q6}</p></div>
              <div className="qa-full"><span className="q-label">7. Anything else to know?</span><p>{selectedApp.q7}</p></div>
            </div>

            <div className="modal-actions">
              {selectedApp.status === 'pending' && (
                <>
                  <button className="btn-approve" onClick={() => handleUpdateStatus(selectedApp.id, selectedApp.pets.id, 'approved')} disabled={isUpdating}>Approve</button>
                  <button className="btn-reject" onClick={() => handleUpdateStatus(selectedApp.id, selectedApp.pets.id, 'rejected')} disabled={isUpdating}>Decline</button>
                </>
              )}
              
              {selectedApp.status === 'approved' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div className="status-notice" style={{ color: '#10B981', fontWeight: 600 }}>✓ Approved.</div>
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