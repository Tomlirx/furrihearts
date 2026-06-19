import { createAdminClient } from '@/utils/supabase/admin';
import { getReports } from '@/lib/admin-data';
import '../../dashboard/styles.css';
import AdminReportsList from './AdminReportsList';

export default async function AdminReportsPage() {
  const admin = createAdminClient();
  const reports = await getReports(admin);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Reports ({reports.length})</h1>
      <AdminReportsList reports={reports} />
    </div>
  );
}
