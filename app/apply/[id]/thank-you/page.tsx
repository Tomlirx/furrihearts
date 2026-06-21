'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fetchPetById } from '@/lib/pet-service';
import './styles.css';

export default function ThankYouPage() {
  const t = useTranslations('ApplyThankYou');
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
        <h1>{pet ? t.rich('headingWithPet', { name: pet.name, em: (chunks) => <em>{chunks}</em> }) : t('heading')}</h1>
        <p>{t('subtitle')}</p>
      </div>

      <div className="timeline-card">
        <h3>{t('whatHappensNext')}</h3>
        <div className="timeline-step done">
          <div className="t-dot">✓</div>
          <div><strong>{t('step1Title')}</strong><p>{t('step1Desc')}</p></div>
        </div>
        <div className="timeline-step active">
          <div className="t-dot">2</div>
          <div><strong>{t('step2Title')}</strong><p>{t('step2Desc')}</p></div>
        </div>
        <div className="timeline-step pending">
          <div className="t-dot">3</div>
          <div><strong>{t('step3Title')}</strong><p>{t('step3Desc')}</p></div>
        </div>
      </div>

      <div className="thankyou-cta">
        <Link href="/my-applications" className="btn-primary-cta">{t('checkApplications')}</Link>
        <Link href="/browse" className="btn-outline-cta">{t('browseMore')}</Link>
      </div>
    </div>
  );
}
