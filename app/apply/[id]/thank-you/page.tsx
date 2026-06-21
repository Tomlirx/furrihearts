'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fetchPetById } from '@/lib/pet-service';
import './styles.css';

export default function ThankYouPage() {
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await fetchPetById(supabase, String(id));
      setPet(data);
    }
    load();
  }, [id]);

  return (
    <div className="thankyou-wrap">
      <div className="thankyou-hero">
        <div style={{ fontSize: '64px' }}>🎉</div>
        <h1>Thank You for Your Interest{pet ? <> in <em>{pet.name}</em></> : ''}!</h1>
        <p>Your application has been submitted. We'll notify you as soon as the rescuer responds.</p>
      </div>

      <div className="timeline-card">
        <h3>What happens next?</h3>
        <div className="timeline-step done">
          <div className="t-dot">✓</div>
          <div><strong>Application received</strong><p>We've sent your application to the rescuer.</p></div>
        </div>
        <div className="timeline-step active">
          <div className="t-dot">2</div>
          <div><strong>Under review</strong><p>The rescuer is reviewing your application and answers.</p></div>
        </div>
        <div className="timeline-step pending">
          <div className="t-dot">3</div>
          <div><strong>Awaiting decision</strong><p>You'll be notified once a decision is made.</p></div>
        </div>
      </div>

      <div className="thankyou-cta">
        <Link href="/my-applications" className="btn-primary-cta">Check My Applications</Link>
        <Link href="/browse" className="btn-outline-cta">Browse More Pets</Link>
      </div>
    </div>
  );
}
