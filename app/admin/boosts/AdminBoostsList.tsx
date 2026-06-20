'use client';

import { useState } from 'react';
import { reviewBoost, getBoostReceiptUrl } from '@/app/actions/admin';

export default function AdminBoostsList({ boosts }: { boosts: any[] }) {
  const [rows, setRows] = useState(boosts);
  const [loadingReceipt, setLoadingReceipt] = useState<string | null>(null);

  const handleReview = async (boost: any, approve: boolean) => {
    setRows((prev) => prev.map((b) => (b.id === boost.id ? { ...b, status: approve ? 'approved' : 'rejected' } : b)));
    await reviewBoost(boost.id, boost.pet_id, boost.days, approve);
  };

  const handleViewReceipt = async (boostId: string) => {
    setLoadingReceipt(boostId);
    const result = await getBoostReceiptUrl(boostId);
    setLoadingReceipt(null);
    if (result.error) {
      alert(result.error);
      return;
    }
    window.open(result.url, '_blank', 'noopener,noreferrer');
  };

  if (rows.length === 0) {
    return <div className="empty-state"><div className="empty-icon">⭐</div><h3>No boost requests</h3><p>Requests to feature a listing will appear here.</p></div>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr><th>Pet</th><th>Tier</th><th>Days</th><th>Price</th><th>Receipt</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id}>
            <td>{b.pets?.name || '—'}</td>
            <td>{b.tier}</td>
            <td>{b.days}</td>
            <td>RM{b.price}</td>
            <td>
              {b.receipt_url ? (
                <button className="admin-btn" onClick={() => handleViewReceipt(b.id)} disabled={loadingReceipt === b.id}>
                  {loadingReceipt === b.id ? 'Loading...' : 'View Receipt'}
                </button>
              ) : '—'}
            </td>
            <td>{b.status}</td>
            <td>
              {b.status === 'pending_verification' && (
                <>
                  <button className="admin-btn success" onClick={() => handleReview(b, true)}>Approve</button>
                  <button className="admin-btn danger" onClick={() => handleReview(b, false)}>Reject</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
