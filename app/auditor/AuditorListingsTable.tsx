'use client';

import { useState } from 'react';
import Link from 'next/link';
import { reviewListing, setListingFeatured } from '@/app/actions/auditor';

function rescuerName(pet: any) {
  if (!pet.profiles?.first_name) return '—';
  return `${pet.profiles.first_name} ${pet.profiles.last_name || ''}`.trim();
}

export default function AuditorListingsTable({ pending, recent }: { pending: any[]; recent: any[] }) {
  const [pendingRows, setPendingRows] = useState(pending);
  const [recentRows, setRecentRows] = useState(recent);

  const handleReview = async (pet: any, decision: 'approved' | 'rejected') => {
    setPendingRows((prev) => prev.filter((p) => p.id !== pet.id));
    setRecentRows((prev) => [{ ...pet, review_status: decision }, ...prev]);
    await reviewListing(pet.id, decision);
  };

  const handleFeatureToggle = async (petId: string, featured: boolean) => {
    setRecentRows((prev) => prev.map((p) => (p.id === petId ? { ...p, is_featured: featured } : p)));
    await setListingFeatured(petId, featured);
  };

  return (
    <>
      <h3 style={{ marginBottom: '12px' }}>Pending Review ({pendingRows.length})</h3>
      {pendingRows.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>No listings waiting</h3><p>New rescuer submissions will appear here.</p></div>
      ) : (
        <table className="admin-table" style={{ marginBottom: '32px' }}>
          <thead>
            <tr><th>Pet</th><th>Rescuer</th><th>Location</th><th></th></tr>
          </thead>
          <tbody>
            {pendingRows.map((pet) => (
              <tr key={pet.id}>
                <td><Link href={`/pet/${pet.id}`} target="_blank">{pet.name}</Link></td>
                <td>{rescuerName(pet)}</td>
                <td>{pet.location}</td>
                <td>
                  <button className="admin-btn success" onClick={() => handleReview(pet, 'approved')}>Approve</button>
                  <button className="admin-btn danger" onClick={() => handleReview(pet, 'rejected')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginBottom: '12px' }}>Recently Reviewed</h3>
      {recentRows.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>Nothing reviewed yet</h3></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Pet</th><th>Rescuer</th><th>Status</th><th>Featured</th></tr>
          </thead>
          <tbody>
            {recentRows.map((pet) => (
              <tr key={pet.id}>
                <td><Link href={`/pet/${pet.id}`} target="_blank">{pet.name}</Link></td>
                <td>{rescuerName(pet)}</td>
                <td>{pet.review_status}</td>
                <td>
                  {pet.review_status === 'approved' ? (
                    pet.is_featured ? (
                      <button className="admin-btn danger" onClick={() => handleFeatureToggle(pet.id, false)}>Unfeature</button>
                    ) : (
                      <button className="admin-btn success" onClick={() => handleFeatureToggle(pet.id, true)}>⭐ Feature</button>
                    )
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
