import { createAdminClient } from '@/utils/supabase/admin';
import { getAllApplications } from '@/lib/admin-data';
import '../../dashboard/styles.css';
import AdminApplicationsTable from './AdminApplicationsTable';

export default async function AdminApplicationsPage() {
  const admin = createAdminClient();
  const apps = await getAllApplications(admin);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Applications ({apps.length})</h1>
      <AdminApplicationsTable apps={apps} />
    </div>
  );
}
