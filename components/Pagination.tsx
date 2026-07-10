'use client';

import { ChevronLeft, ChevronRight } from './icons';

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button className="pagination-btn" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <ChevronLeft size={16} /> Prev
      </button>
      <span className="pagination-info">Page {page} of {totalPages}</span>
      <button className="pagination-btn" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
