import Link from 'next/link';
import { createAdminClient } from '@/utils/supabase/admin';
import { getAllUsers } from '@/lib/admin-data';
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
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Admin</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id}>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.email}</td>
              <td>{u.phone || '—'}</td>
              <td>{u.is_admin ? '✅' : ''}</td>
              <td><Link href={`/admin/users/${u.id}`} className="admin-btn">View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
