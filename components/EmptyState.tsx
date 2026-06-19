import { ReactNode } from 'react';
import Link from 'next/link';

export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCta,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn-add-pet empty-state-cta">{ctaLabel}</Link>
      )}
      {ctaLabel && onCta && !ctaHref && (
        <button className="btn-add-pet empty-state-cta" onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  );
}
