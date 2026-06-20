'use client';

import { useState } from 'react';
import { toggleStateLaunch } from '@/app/actions/admin';

export default function AdminLocationsTable({ rollouts }: { rollouts: any[] }) {
  const [rows, setRows] = useState(rollouts);

  const handleToggle = async (stateName: string, launched: boolean) => {
    setRows((prev) => prev.map((r) => (r.state_name === stateName ? { ...r, is_launched: launched } : r)));
    await toggleStateLaunch(stateName, launched);
  };

  return (
    <table className="admin-table">
      <thead>
        <tr><th>State</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.state_name}>
            <td>{r.state_name}</td>
            <td>{r.is_launched ? 'Launched' : 'Not launched'}</td>
            <td>
              {r.is_launched ? (
                <button className="admin-btn danger" onClick={() => handleToggle(r.state_name, false)}>Unlaunch</button>
              ) : (
                <button className="admin-btn success" onClick={() => handleToggle(r.state_name, true)}>Launch</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
