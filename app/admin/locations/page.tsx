import { createAdminClient } from '@/utils/supabase/admin';
import { getAllStateRollouts } from '@/lib/admin-data';
import '../../dashboard/styles.css';
import AdminLocationsTable from './AdminLocationsTable';

export default async function AdminLocationsPage() {
  const admin = createAdminClient();
  const rollouts = await getAllStateRollouts(admin);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Locations ({rollouts.length})</h1>
      <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '16px' }}>
        Control which states/territories are visible in location dropdowns across the site as you roll out coverage.
      </p>
      <AdminLocationsTable rollouts={rollouts} />
    </div>
  );
}
