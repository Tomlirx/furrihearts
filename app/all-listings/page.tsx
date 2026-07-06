'use client';
import '../dashboard/styles.css';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { getLocalListings } from '@/lib/local-store';
import { getMyPets, getIncomingApplications, getMyBoosts } from '@/lib/profile-data';
import { isPetCurrentlyFeatured } from '@/lib/pet-service';
import { BOOST_ENABLED } from '@/lib/feature-flags';
import { setListingVisibility } from '@/app/actions/listings';
import BoostModal from '@/components/BoostModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import DashboardTabs from '@/components/DashboardTabs';
import { useToast } from '@/lib/useToast';

const PAGE_SIZE = 20;

export default function AllListingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<any[]>([]);
  const [appCounts, setAppCounts] = useState<Record<string, { total: number; approved: number; declined: number }>>({});
  const [boostsByPet, setBoostsByPet] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [offlineTarget, setOfflineTarget] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    async function load() {
      setPets(getLocalListings());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login?next=/all-listings'); return; }
      const myPets = await getMyPets(supabase, user.id);
      if (myPets.length) {
        setPets(myPets);
        const apps = await getIncomingApplications(supabase, myPets.map((p: any) => p.id));
        const counts: Record<string, { total: number; approved: number; declined: number }> = {};
        apps.forEach((app: any) => {
          const id = app.pet_id;
          if (!counts[id]) counts[id] = { total: 0, approved: 0, declined: 0 };
          counts[id].total++;
          if (app.status === 'approved') counts[id].approved++;
          if (app.status === 'rejected') counts[id].declined++;
        });
        setAppCounts(counts);

        const boosts = await getMyBoosts(supabase, myPets.map((p: any) => p.id));
        const latestByPet: Record<string, any> = {};
        boosts.forEach((b: any) => {
          if (!latestByPet[b.pet_id]) latestByPet[b.pet_id] = b; // already ordered newest-first
        });
        setBoostsByPet(latestByPet);
      }
      setLoading(false);
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const allCounts = Object.values(appCounts);
    return {
      active: pets.filter((p) => p.status === 'available' && !p.is_hidden).length,
      applications: allCounts.reduce((sum, c) => sum + c.total, 0),
      approved: allCounts.reduce((sum, c) => sum + c.approved, 0),
      declined: allCounts.reduce((sum, c) => sum + c.declined, 0),
    };
  }, [pets, appCounts]);

  const filtered = pets.filter((pet) => {
    if (filter === 'live' && (pet.status !== 'available' || pet.is_hidden || pet.review_status !== 'approved')) return false;
    if (filter === 'closed' && pet.status !== 'adopted') return false;
    if (filter === 'offline' && !pet.is_hidden) return false;
    if (filter === 'pending' && pet.review_status !== 'pending') return false;
    if (filter === 'rejected' && pet.review_status !== 'rejected') return false;
    if (search && !pet.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (key: string) => {
    setFilter(key);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const goOffline = (pet: any) => setOfflineTarget(pet);

  const listingStatusBadge = (pet: any) => {
    if (pet.review_status === 'pending') return { cls: 's-pending', label: 'Pending Review' };
    if (pet.review_status === 'rejected') return { cls: 's-rejected', label: 'Rejected' };
    if (pet.is_hidden) return { cls: 's-offline', label: 'Offline' };
    if (pet.status === 'available') return { cls: 's-live', label: 'Live' };
    return { cls: 's-closed', label: 'Closed' };
  };

  const confirmGoOffline = async () => {
    if (!offlineTarget) return;
    setIsUpdating(true);
    const result = await setListingVisibility(offlineTarget.id, true);
    if (result.error) {
      showToast(result.error, 'decline');
    } else {
      setPets((prev) => prev.map((p) => (p.id === offlineTarget.id ? { ...p, is_hidden: true } : p)));
      showToast(`${offlineTarget.name} is now offline`, 'decline');
    }
    setIsUpdating(false);
    setOfflineTarget(null);
  };

  const goOnline = async (pet: any) => {
    setIsUpdating(true);
    const result = await setListingVisibility(pet.id, false);
    if (result.error) {
      showToast(result.error, 'decline');
    } else {
      setPets((prev) => prev.map((p) => (p.id === pet.id ? { ...p, is_hidden: false } : p)));
      showToast(`${pet.name} is back online`, 'success');
    }
    setIsUpdating(false);
  };

  if (loading) return <div className="loading-state">Loading your listings...</div>;

  return (
    <div className="dashboard-container">
      <DashboardTabs />
      <div className="dashboard-header">
        <div><h1>My Listings</h1><p>Manage every pet you've listed for adoption.</p></div>
      </div>

      <div className="stats-grid">
        <div className="stat-tile orange"><div className="stat-tile-icon">🐾</div><div className="stat-tile-num">{stats.active}</div><div className="stat-tile-label">Active</div></div>
        <div className="stat-tile blue"><div className="stat-tile-icon">📋</div><div className="stat-tile-num">{stats.applications}</div><div className="stat-tile-label">Applications</div></div>
        <div className="stat-tile green"><div className="stat-tile-icon">✅</div><div className="stat-tile-num">{stats.approved}</div><div className="stat-tile-label">Approved</div></div>
        <div className="stat-tile purple"><div className="stat-tile-icon">❌</div><div className="stat-tile-num">{stats.declined}</div><div className="stat-tile-label">Declined</div></div>
      </div>

      <div className="listings-toolbar">
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>All ({pets.length})</button>
          <button className={`filter-tab ${filter === 'live' ? 'active' : ''}`} onClick={() => handleFilterChange('live')}>Live ({pets.filter((p) => p.status === 'available' && !p.is_hidden && p.review_status === 'approved').length})</button>
          <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => handleFilterChange('pending')}>Pending Review ({pets.filter((p) => p.review_status === 'pending').length})</button>
          <button className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => handleFilterChange('rejected')}>Rejected ({pets.filter((p) => p.review_status === 'rejected').length})</button>
          <button className={`filter-tab ${filter === 'offline' ? 'active' : ''}`} onClick={() => handleFilterChange('offline')}>Offline ({pets.filter((p) => p.is_hidden).length})</button>
          <button className={`filter-tab ${filter === 'closed' ? 'active' : ''}`} onClick={() => handleFilterChange('closed')}>Closed ({pets.filter((p) => p.status === 'adopted').length})</button>
        </div>
        <input className="search-input" placeholder="Search listings..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
      </div>

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>No listings yet</h3>
          <p>Ready to find your first pet a forever home? Create your first listing — it only takes 3 minutes.</p>
        </div>
      ) : (
        <>
        <div className="listings-grid">
          {paginated.map((pet) => {
            const counts = appCounts[pet.id] || { total: 0, approved: 0, declined: 0 };
            const isActiveBoost = isPetCurrentlyFeatured(pet);
            const latestBoost = boostsByPet[pet.id];
            const isPendingBoost = latestBoost?.status === 'pending_verification';
            const statusBadge = listingStatusBadge(pet);
            return (
              <div className="listing-card" key={pet.id} style={{ position: 'relative' }}>
                <span className={`lc-status ${statusBadge.cls}`}>{statusBadge.label}</span>
                <Link href={`/pet/${pet.id}`}>
                  <Image src={pet.image_url} alt={pet.name} width={400} height={180} sizes="(max-width: 768px) 100vw, 360px" />
                </Link>
                <div className="listing-info">
                  <div className="listing-title-row">
                    <h4>{pet.name}</h4>
                    {isActiveBoost && <span className="boost-status active">⭐ Featured</span>}
                    {BOOST_ENABLED && !isActiveBoost && isPendingBoost && <span className="boost-status pending">Boost pending review</span>}
                  </div>
                  <p>{pet.species} · {pet.gender} · {pet.location}</p>
                  <p style={{ marginBottom: '12px' }}>{counts.total} application{counts.total === 1 ? '' : 's'} · {counts.approved} approved</p>
                  <div className="listing-actions">
                    {BOOST_ENABLED && (!isActiveBoost && !isPendingBoost ? (
                      <BoostModal petId={pet.id} petName={pet.name} triggerLabel="⭐ Boost" triggerClassName="" />
                    ) : <span />)}
                    <Link href={`/manage-applications?pet=${pet.id}`}>Applications</Link>
                    {pet.review_status === 'rejected' ? (
                      <span style={{ fontSize: '13px', color: 'var(--light)' }}>Not shown to adopters</span>
                    ) : pet.is_hidden ? (
                      <button className="btn-view-full" disabled={isUpdating} onClick={() => goOnline(pet)}>Bring Online</button>
                    ) : (
                      <button className="btn-view-full" disabled={isUpdating} onClick={() => goOffline(pet)}>Take Offline</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

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
