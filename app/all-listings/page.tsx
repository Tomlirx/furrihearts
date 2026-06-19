'use client';
import '../dashboard/styles.css';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getLocalListings } from '@/lib/local-store';
import { getMyPets, getIncomingApplications } from '@/lib/profile-data';

export default function AllListingsPage() {
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<any[]>([]);
  const [appCounts, setAppCounts] = useState<Record<string, { total: number; approved: number; declined: number }>>({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setPets(getLocalListings());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
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
      }
      setLoading(false);
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const allCounts = Object.values(appCounts);
    return {
      active: pets.filter((p) => p.status === 'available').length,
      applications: allCounts.reduce((sum, c) => sum + c.total, 0),
      approved: allCounts.reduce((sum, c) => sum + c.approved, 0),
      declined: allCounts.reduce((sum, c) => sum + c.declined, 0),
    };
  }, [pets, appCounts]);

  const filtered = pets.filter((pet) => {
    if (filter === 'live' && pet.status !== 'available') return false;
    if (filter === 'closed' && pet.status !== 'adopted') return false;
    if (search && !pet.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading-state">Loading your listings...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div><h1>My Listings</h1><p>Manage every pet you've listed for adoption.</p></div>
        <Link href="/rescuer-listing" className="btn-add-pet">+ New Listing</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-tile orange"><div className="stat-tile-icon">🐾</div><div className="stat-tile-num">{stats.active}</div><div className="stat-tile-label">Active</div></div>
        <div className="stat-tile blue"><div className="stat-tile-icon">📋</div><div className="stat-tile-num">{stats.applications}</div><div className="stat-tile-label">Applications</div></div>
        <div className="stat-tile green"><div className="stat-tile-icon">✅</div><div className="stat-tile-num">{stats.approved}</div><div className="stat-tile-label">Approved</div></div>
        <div className="stat-tile purple"><div className="stat-tile-icon">❌</div><div className="stat-tile-num">{stats.declined}</div><div className="stat-tile-label">Declined</div></div>
      </div>

      <div className="listings-toolbar">
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({pets.length})</button>
          <button className={`filter-tab ${filter === 'live' ? 'active' : ''}`} onClick={() => setFilter('live')}>Live ({pets.filter((p) => p.status === 'available').length})</button>
          <button className={`filter-tab ${filter === 'closed' ? 'active' : ''}`} onClick={() => setFilter('closed')}>Closed ({pets.filter((p) => p.status === 'adopted').length})</button>
        </div>
        <input className="search-input" placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>No listings yet</h3>
          <p>Ready to find your first pet a forever home? Create your first listing — it only takes 3 minutes.</p>
          <Link href="/rescuer-listing" className="btn-add-pet" style={{ marginTop: '16px', display: 'inline-block' }}>+ Create Your First Listing</Link>
        </div>
      ) : (
        <div className="listings-grid">
          {filtered.map((pet) => {
            const counts = appCounts[pet.id] || { total: 0, approved: 0, declined: 0 };
            return (
              <div className="listing-card" key={pet.id} style={{ position: 'relative' }}>
                <span className={`lc-status ${pet.status === 'available' ? 's-live' : 's-closed'}`}>{pet.status === 'available' ? 'Live' : 'Closed'}</span>
                <img src={pet.image_url} alt={pet.name} />
                <div className="listing-info">
                  <div className="listing-title-row"><h4>{pet.name}</h4></div>
                  <p>{pet.species} · {pet.gender} · {pet.location}</p>
                  <p style={{ marginBottom: '12px' }}>{counts.total} application{counts.total === 1 ? '' : 's'} · {counts.approved} approved</p>
                  <div className="listing-actions">
                    <Link href={`/pet/${pet.id}`}>View</Link>
                    <Link href={`/manage-applications?pet=${pet.id}`}>Applications</Link>
                  </div>
                </div>
              </div>
            );
          })}
          <Link href="/rescuer-listing" className="new-listing-card">
            <div className="plus">+</div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>List a Pet</div>
            <div style={{ fontSize: '12px' }}>Add another pet to your listings</div>
          </Link>
        </div>
      )}
    </div>
  );
}
