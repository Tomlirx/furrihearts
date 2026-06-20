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
      <h1>{name}'s listing is <em>submitted!</em></h1>
      <p>{name}'s adoption profile has been submitted for review. We'll let you know as soon as it's approved and visible to adopters across Malaysia.</p>

      <div className="created-cta">
        <Link href="/rescuer-listing" className="btn-outline-cta">Create New Listing</Link>
        <Link href="/all-listings" className="btn-primary-cta">My Listings</Link>
      </div>

      <div className="whats-next">
        <h3>What happens next?</h3>
        <div className="next-item"><span>🔍</span><div><strong>Our team reviews {name}'s listing</strong><p>A quick check to make sure everything looks good before it goes live.</p></div></div>
        <div className="next-item"><span>👀</span><div><strong>Adopters will discover {name}</strong><p>Once approved, your listing appears in Browse and search results.</p></div></div>
        <div className="next-item"><span>📋</span><div><strong>Applications will come in</strong><p>Interested adopters will fill out a short questionnaire.</p></div></div>
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
