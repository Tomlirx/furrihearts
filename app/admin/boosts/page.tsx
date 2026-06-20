import { createAdminClient } from '@/utils/supabase/admin';
import { getPendingBoosts, getBoostStats } from '@/lib/admin-data';
import '../../dashboard/styles.css';
import AdminBoostsList from './AdminBoostsList';

export default async function AdminBoostsPage() {
  const admin = createAdminClient();
  const [boosts, stats] = await Promise.all([getPendingBoosts(admin), getBoostStats(admin)]);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Listing Boosts ({boosts.length})</h1>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-tile green"><div className="stat-tile-icon">💰</div><div className="stat-tile-num">RM{stats.totalRevenue}</div><div className="stat-tile-label">Total Revenue</div></div>
        <div className="stat-tile orange"><div className="stat-tile-icon">⭐</div><div className="stat-tile-num">{stats.activeBoosts}</div><div className="stat-tile-label">Active Boosts</div></div>
        <div className="stat-tile blue"><div className="stat-tile-icon">✅</div><div className="stat-tile-num">{stats.approvalRate}%</div><div className="stat-tile-label">Approval Rate</div></div>
      </div>

      <AdminBoostsList boosts={boosts} />
    </div>
  );
}
