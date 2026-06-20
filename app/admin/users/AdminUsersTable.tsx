'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toggleUserAuditor } from '@/app/actions/admin';

export default function AdminUsersTable({ users }: { users: any[] }) {
  const [rows, setRows] = useState(users);

  const handleToggleAuditor = async (userId: string, isAuditor: boolean) => {
    setRows((prev) => prev.map((u) => (u.id === userId ? { ...u, is_auditor: isAuditor } : u)));
    await toggleUserAuditor(userId, isAuditor);
  };

  return (
    <table className="admin-table">
      <thead>
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Admin</th><th>Auditor</th><th></th><th></th></tr>
      </thead>
      <tbody>
        {rows.map((u) => (
          <tr key={u.id}>
            <td>{u.first_name} {u.last_name}</td>
            <td>{u.email}</td>
            <td>{u.phone || '—'}</td>
            <td>{u.is_admin ? '✅' : ''}</td>
            <td>{u.is_auditor ? '✅' : ''}</td>
            <td>
              {u.is_auditor ? (
                <button className="admin-btn danger" onClick={() => handleToggleAuditor(u.id, false)}>Revoke Auditor</button>
              ) : (
                <button className="admin-btn success" onClick={() => handleToggleAuditor(u.id, true)}>Grant Auditor</button>
              )}
            </td>
            <td><Link href={`/admin/users/${u.id}`} className="admin-btn">View</Link></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
