import { createAdminClient } from '@/utils/supabase/admin';
import { getPendingListings, getRecentReviewedListings } from '@/lib/admin-data';
import AuditorListingsTable from './AuditorListingsTable';
import '../dashboard/styles.css';

export default async function AuditorPage() {
  const admin = createAdminClient();
  const [pending, recent] = await Promise.all([
    getPendingListings(admin),
    getRecentReviewedListings(admin),
  ]);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Listings Review ({pending.length} pending)</h1>
      <AuditorListingsTable pending={pending} recent={recent} />
    </div>
  );
}
