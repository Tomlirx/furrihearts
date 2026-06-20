import { createAdminClient } from '@/utils/supabase/admin';
import { getAllUsers } from '@/lib/admin-data';
import AdminUsersTable from './AdminUsersTable';
import '../../dashboard/styles.css';

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const admin = createAdminClient();
  const users = await getAllUsers(admin, q);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Users ({users.length})</h1>
      <form>
        <input className="admin-search" name="q" defaultValue={q || ''} placeholder="Search name or email..." />
      </form>
      <AdminUsersTable users={users} />
    </div>
  );
}
