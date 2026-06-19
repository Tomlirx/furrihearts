'use client';
import './styles.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getLocalApplications, getLocalListings } from '@/lib/local-store';
import { localPets, type Pet } from '@/lib/pet-service';
import { getMyPets, getMyApplications, getIncomingApplications } from '@/lib/profile-data';
import EmptyState from '@/components/EmptyState';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('there');
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [incomingApps, setIncomingApps] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setMyApplications(getLocalApplications());
      setMyPets([...getLocalListings(), ...localPets.filter((pet) => pet.rescuer_id === 'demo-rescuer')]);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).single();
      setUserName(profile?.first_name || user.email?.split('@')[0] || 'there');

      const [adopterApps, petsData] = await Promise.all([
        getMyApplications(supabase, user.id),
        getMyPets(supabase, user.id),
      ]);

      if (adopterApps.length) setMyApplications(adopterApps);
      if (petsData.length) {
        setMyPets(petsData);
        const incoming = await getIncomingApplications(supabase, petsData.map((p: Pet) => p.id));
        setIncomingApps(incoming);
      }

      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading-state">Loading your dashboard...</div>;

  const pendingCount = incomingApps.filter((a) => a.status === 'pending').length;
  const activeListings = myPets.filter((p) => p.status === 'available').length;
  const approvedCount = incomingApps.filter((a) => a.status === 'approved').length;

  return (
    <div className="dashboard-container">
      <div className="welcome-bar">
        <div>
          <h1>Welcome back, {userName}! 🌿</h1>
          <p>You have <strong>{pendingCount}</strong> pending application{pendingCount === 1 ? '' : 's'} to review today.</p>
        </div>
        <Link href="/rescuer-listing" className="btn-add-pet">+ New Listing</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-tile orange"><div className="stat-tile-icon">🐾</div><div className="stat-tile-num">{activeListings}</div><div className="stat-tile-label">Active Listings</div></div>
        <div className="stat-tile green"><div className="stat-tile-icon">✅</div><div className="stat-tile-num">{approvedCount}</div><div className="stat-tile-label">Approved Adoptions</div></div>
        <div className="stat-tile blue"><div className="stat-tile-icon">📋</div><div className="stat-tile-num">{incomingApps.length}</div><div className="stat-tile-label">Applications Received</div></div>
        <div className="stat-tile purple"><div className="stat-tile-icon">💌</div><div className="stat-tile-num">{myApplications.length}</div><div className="stat-tile-label">My Applications Sent</div></div>
      </div>

      {myPets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>No listings yet</h3>
          <p>Ready to find your first pet a forever home? Create your first listing — it only takes 3 minutes.</p>
          <Link href="/rescuer-listing" className="btn-add-pet" style={{ marginTop: '16px', display: 'inline-block' }}>+ Create Your First Listing</Link>
        </div>
      ) : (
        <>
          <div className="section-card">
            <div className="section-card-header">
              <h3>Active Listings</h3>
              <Link href="/all-listings">View all →</Link>
            </div>
            {myPets.slice(0, 4).map((pet) => (
              <div className="listing-row" key={pet.id}>
                <img src={pet.image_url} className="row-thumb" alt={pet.name} />
                <div className="row-info"><h4>{pet.name} · {pet.gender}</h4><p>{pet.age} · {pet.location}</p></div>
                <div className="row-actions"><Link href={`/pet/${pet.id}`}>View</Link></div>
              </div>
            ))}
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <h3>Recent Applications</h3>
              <Link href="/manage-applications">View all →</Link>
            </div>
            {incomingApps.length === 0 ? (
              <EmptyState icon="📋" title="No applications yet" description="When adopters apply for your pets, they'll show up here." />
            ) : incomingApps.slice(0, 4).map((app) => (
              <div className="app-row" key={app.id}>
                <div className="row-avatar">{(app.profiles?.first_name || 'A')[0]}</div>
                <div className="row-info"><h4>{app.profiles?.first_name || 'Demo'} {app.profiles?.last_name || 'Adopter'}</h4><p>For: {app.pets?.name}</p></div>
                <span className={`status-badge ${app.status}`}>{app.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-card">
        <div className="section-card-header">
          <h3>My Applications</h3>
          <Link href="/my-applications">View all →</Link>
        </div>
        {myApplications.length === 0 ? (
          <EmptyState icon="💌" title="No applications yet" description="You haven't applied for any pets yet." ctaLabel="Browse Pets" ctaHref="/browse" />
        ) : myApplications.slice(0, 3).map((app) => (
          <div className="app-row" key={app.id}>
            <img src={app.pets?.image_url} className="row-thumb" style={{ borderRadius: '50%' }} alt={app.pets?.name} />
            <div className="row-info"><h4>Application for {app.pets?.name}</h4></div>
            <span className={`status-badge ${app.status}`}>{app.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
