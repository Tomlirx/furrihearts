import Link from 'next/link';
import { createAdminClient, isAdminConfigured } from '@/utils/supabase/admin';
import { getAdminOverview } from '@/lib/admin-data';
import '../dashboard/styles.css';

export default async function AdminOverviewPage() {
  if (!isAdminConfigured()) {
    return (
      <div>
        <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '12px' }}>Admin Panel</h1>
        <div className="empty-state">
          <div className="empty-icon">⚙️</div>
          <h3>SUPABASE_SERVICE_ROLE_KEY is not set</h3>
          <p>Add it to your environment variables (locally and on Vercel) to enable the admin panel.</p>
        </div>
      </div>
    );
  }

  const admin = createAdminClient();
  const stats = await getAdminOverview(admin);

  const tiles = [
    { label: 'Users', value: stats.userCount, href: '/admin/users', color: 'orange' },
    { label: 'Pets', value: stats.petCount, href: '/admin/pets', color: 'green' },
    { label: 'Applications', value: stats.appCount, href: '/admin/applications', color: 'blue' },
    { label: 'Open Reports', value: stats.openReports, href: '/admin/reports', color: 'purple' },
    { label: 'Open Contact Messages', value: stats.openContacts, href: '/admin/contact', color: 'orange' },
    { label: 'Pending Boosts', value: stats.pendingBoosts, href: '/admin/boosts', color: 'green' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '20px' }}>Admin Overview</h1>
      <div className="stats-grid">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={`stat-tile ${tile.color}`}>
              <div className="stat-tile-num">{tile.value}</div>
              <div className="stat-tile-label">{tile.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
