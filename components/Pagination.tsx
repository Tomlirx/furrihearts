'use client';

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
      <button className="pagination-btn" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        ‹ Prev
      </button>
      <span className="pagination-info">Page {page} of {totalPages}</span>
      <button className="pagination-btn" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        Next ›
      </button>
    </div>
  );
}
