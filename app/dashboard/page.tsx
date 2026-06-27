'use client';
import './styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getLocalApplications, getLocalListings } from '@/lib/local-store';
import { localPets, isPetCurrentlyFeatured, type Pet } from '@/lib/pet-service';
import { BOOST_ENABLED } from '@/lib/feature-flags';
import { getMyPets, getMyApplications, getIncomingApplications, getMyBoosts } from '@/lib/profile-data';
import { setListingVisibility } from '@/app/actions/listings';
import EmptyState from '@/components/EmptyState';
import DashboardTabs from '@/components/DashboardTabs';
import BoostModal from '@/components/BoostModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/lib/useToast';

export default function DashboardOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('there');
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [incomingApps, setIncomingApps] = useState<any[]>([]);
  const [boostsByPet, setBoostsByPet] = useState<Record<string, any>>({});
  const [offlineTarget, setOfflineTarget] = useState<Pet | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    async function fetchDashboardData() {
      setMyApplications(getLocalApplications());
      setMyPets([...getLocalListings(), ...localPets.filter((pet) => pet.rescuer_id === 'demo-rescuer')]);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login?next=/dashboard'); return; }

      const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).single();
      setUserName(profile?.first_name || user.email?.split('@')[0] || 'there');

      const [adopterApps, petsData] = await Promise.all([
        getMyApplications(supabase, user.id),
        getMyPets(supabase, user.id),
      ]);

      setMyApplications(adopterApps);
      setMyPets(petsData);

      const incoming = await getIncomingApplications(supabase, petsData.map((p: Pet) => p.id));
      setIncomingApps(incoming);

      const boosts = await getMyBoosts(supabase, petsData.map((p: Pet) => p.id));
      const latestByPet: Record<string, any> = {};
      boosts.forEach((b: any) => {
        if (!latestByPet[b.pet_id]) latestByPet[b.pet_id] = b; // already ordered newest-first
      });
      setBoostsByPet(latestByPet);

      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading-state">Loading your dashboard...</div>;

  const pendingCount = incomingApps.filter((a) => a.status === 'pending').length;
  const activeListings = myPets.filter((p) => p.status === 'available' && !p.is_hidden).length;
  const approvedCount = incomingApps.filter((a) => a.status === 'approved').length;

  const confirmGoOffline = async () => {
    if (!offlineTarget) return;
    setIsUpdating(true);
    const result = await setListingVisibility(offlineTarget.id, true);
    if (result.error) {
      showToast(result.error, 'decline');
    } else {
      setMyPets((prev) => prev.map((p) => (p.id === offlineTarget.id ? { ...p, is_hidden: true } : p)));
      showToast(`${offlineTarget.name} is now offline`, 'decline');
    }
    setIsUpdating(false);
    setOfflineTarget(null);
  };

  const goOnline = async (pet: Pet) => {
    setIsUpdating(true);
    const result = await setListingVisibility(pet.id, false);
    if (result.error) {
      showToast(result.error, 'decline');
    } else {
      setMyPets((prev) => prev.map((p) => (p.id === pet.id ? { ...p, is_hidden: false } : p)));
      showToast(`${pet.name} is back online`, 'success');
    }
    setIsUpdating(false);
  };

  return (
    <div className="dashboard-container">
      <DashboardTabs />
      <div className="welcome-bar">
        <div>
          <h1>Welcome back, {userName}! 🌿</h1>
          <p>You have <strong>{pendingCount}</strong> pending application{pendingCount === 1 ? '' : 's'} to review today.</p>
        </div>
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
        </div>
      ) : (
        <>
          <div className="section-card">
            <div className="section-card-header">
              <h3>Active Listings</h3>
              <Link href="/all-listings">View all →</Link>
            </div>
            {myPets.slice(0, 4).map((pet) => {
              const isActiveBoost = isPetCurrentlyFeatured(pet);
              const isPendingBoost = boostsByPet[pet.id]?.status === 'pending_verification';
              return (
                <div className="listing-row" key={pet.id}>
                  <img src={pet.image_url} className="row-thumb" alt={pet.name} />
                  <div className="row-info">
                    <h4>
                      {pet.name} · {pet.gender}
                      {pet.review_status === 'pending' && <span className="boost-status pending">Pending Review</span>}
                      {pet.review_status === 'rejected' && <span className="boost-status rejected">Rejected</span>}
                      {pet.is_hidden && <span className="boost-status offline">Offline</span>}
                      {isActiveBoost && <span className="boost-status active">⭐ Featured</span>}
                      {BOOST_ENABLED && !isActiveBoost && isPendingBoost && <span className="boost-status pending">Boost pending</span>}
                    </h4>
                    <p>{pet.age} · {pet.location}</p>
                  </div>
                  <div className="row-actions">
                    {BOOST_ENABLED && !isActiveBoost && !isPendingBoost && (
                      <BoostModal petId={pet.id} petName={pet.name} triggerLabel="⭐ Boost" triggerClassName="" />
                    )}
                    {pet.is_hidden ? (
                      <button className="btn-view-full" disabled={isUpdating} onClick={() => goOnline(pet)}>Bring Online</button>
                    ) : (
                      <button className="btn-view-full" disabled={isUpdating} onClick={() => setOfflineTarget(pet)}>Take Offline</button>
                    )}
                    <Link href={`/pet/${pet.id}`}>View</Link>
                  </div>
                </div>
              );
            })}
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

      <ConfirmDialog
        open={!!offlineTarget}
        icon="👁️"
        title={`Take ${offlineTarget?.name} offline?`}
        body="This listing will be hidden from Browse, Home, and search — adopters won't be able to find or apply to it until you bring it back online."
        confirmLabel="Take Offline"
        cancelLabel="Keep it online"
        danger
        onConfirm={confirmGoOffline}
        onCancel={() => setOfflineTarget(null)}
      />

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
