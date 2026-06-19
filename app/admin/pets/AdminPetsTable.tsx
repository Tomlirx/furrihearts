'use client';

import { useState } from 'react';
import { updatePetStatus, deletePet } from '@/app/actions/admin';

export default function AdminPetsTable({ pets }: { pets: any[] }) {
  const [rows, setRows] = useState(pets);

  const handleStatusChange = async (petId: string, status: string) => {
    setRows((prev) => prev.map((p) => (p.id === petId ? { ...p, status } : p)));
    await updatePetStatus(petId, status);
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('Delete this pet listing permanently?')) return;
    setRows((prev) => prev.filter((p) => p.id !== petId));
    await deletePet(petId);
  };

  return (
    <table className="admin-table">
      <thead>
        <tr><th>Name</th><th>Rescuer</th><th>Location</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        {rows.map((pet) => (
          <tr key={pet.id}>
            <td>{pet.name}</td>
            <td>{pet.profiles?.first_name || '—'} {pet.profiles?.last_name || ''}</td>
            <td>{pet.location}</td>
            <td>
              <select className="admin-select" value={pet.status} onChange={(e) => handleStatusChange(pet.id, e.target.value)}>
                <option value="available">available</option>
                <option value="adopted">adopted</option>
              </select>
            </td>
            <td><button className="admin-btn danger" onClick={() => handleDelete(pet.id)}>Delete</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
