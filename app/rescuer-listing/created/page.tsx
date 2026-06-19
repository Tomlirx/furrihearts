'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './styles.css';

function CreatedContent() {
  const params = useSearchParams();
  const name = params.get('name') || 'Your pet';

  return (
    <div className="created-wrap">
      <div className="confetti-wrap">
        {['🎉', '🐾', '✨', '🎊', '❤️'].map((e, i) => (
          <span key={i} className="confetti" style={{ left: `${10 + i * 18}%`, animationDelay: `${i * 0.3}s` }}>{e}</span>
        ))}
      </div>

      <div style={{ fontSize: '64px' }}>🐱</div>
      <h1>{name}'s listing is <em>live!</em></h1>
      <p>{name}'s adoption profile has been published and is now visible to adopters across Malaysia. We'll notify you as soon as applications come in!</p>

      <div className="created-cta">
        <Link href="/browse" className="btn-outline-cta">View Listing</Link>
        <Link href="/rescuer-listing" className="btn-outline-cta">Create New Listing</Link>
        <Link href="/all-listings" className="btn-primary-cta">My Listings</Link>
      </div>

      <div className="whats-next">
        <h3>What happens next?</h3>
        <div className="next-item"><span>👀</span><div><strong>Adopters will discover {name}</strong><p>Your listing now appears in Browse and search results.</p></div></div>
        <div className="next-item"><span>📋</span><div><strong>Applications will come in</strong><p>Interested adopters will fill out a short questionnaire.</p></div></div>
        <div className="next-item"><span>✅</span><div><strong>Review & approve</strong><p>Review applications in your Manage Applications inbox.</p></div></div>
      </div>
    </div>
  );
}

export default function ListingCreatedPage() {
  return (
    <Suspense fallback={null}>
      <CreatedContent />
    </Suspense>
  );
}
