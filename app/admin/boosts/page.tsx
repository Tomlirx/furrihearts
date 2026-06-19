import { createAdminClient } from '@/utils/supabase/admin';
import { getPendingBoosts } from '@/lib/admin-data';
import '../../dashboard/styles.css';
import AdminBoostsList from './AdminBoostsList';

export default async function AdminBoostsPage() {
  const admin = createAdminClient();
  const boosts = await getPendingBoosts(admin);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Listing Boosts ({boosts.length})</h1>
      <AdminBoostsList boosts={boosts} />
    </div>
  );
}
