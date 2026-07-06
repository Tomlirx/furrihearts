'use client';

import './styles.css';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchPetById, findLocalPetById } from '@/lib/pet-service';

// Stored verbatim into applications.q1..q6 — kept as stable English values so
// the (deferred, English-only) rescuer/admin dashboards stay consistent
// regardless of the applicant's locale. Display labels are translated
// separately and zipped to these by index.
const Q1_VALUES = ["I'm looking for a companion", "My current pet needs a friend", "I want to help a rescue animal", "Other"];
const Q2_VALUES = ["Apartment", "Landed property", "Village", "Other"];
const Q3_VALUES = ["Yes, fully secured", "Partially — I plan to", "Not yet", "Not applicable"];
const Q4_VALUES = ["Yes, a cat", "Yes, a dog", "Yes, multiple pets", "No other pets"];
// Q5 form state/DB column is reused here for the "pet experience" question
// (displayed 3rd, between home type and windows/balconies) — the original
// "hours alone" question this column stored has been retired.
const Q5_VALUES = ["This will be my first Pet", "I currently have pet(s)", "I have cared for pets before"];
const Q6_VALUES = ["Yes, everyone is on board", "Most of them", "I live alone", "Not yet discussed"];

export default function QuestionnairePage() {
  const t = useTranslations('Apply');
  const q1Labels = t.raw('q1Options') as string[];
  const q2Labels = t.raw('q2Options') as string[];
  const q3Labels = t.raw('q3Options') as string[];
  const q4Labels = t.raw('q4Options') as string[];
  const q5Labels = t.raw('q5Options') as string[];
  const q6Labels = t.raw('q6Options') as string[];
  const { id } = useParams();
  const router = useRouter();

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State matching database columns
  const [q1, setQ1] = useState<string[]>([]);
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState('');
  const [q5, setQ5] = useState('');
  const [q6, setQ6] = useState('');
  const [q7, setQ7] = useState('');
  const [invalidQs, setInvalidQs] = useState<Set<number>>(new Set());
  const [formError, setFormError] = useState('');

  const questionRefs = {
    1: useRef<HTMLDivElement>(null),
    2: useRef<HTMLDivElement>(null),
    3: useRef<HTMLDivElement>(null),
    4: useRef<HTMLDivElement>(null),
    5: useRef<HTMLDivElement>(null),
    6: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    async function fetchPet() {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(`/apply/${id}`)}`);
        return;
      }

      const localPet = findLocalPetById(String(id));
      if (localPet) setPet(localPet);

      const data = await fetchPetById(supabase, String(id));
      if (data) setPet(data);
      setLoading(false);
    }
    if (id) fetchPet();
  }, [id]);

  const toggleQ1 = (opt: string) => {
    setQ1(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]);
  };

  const validate = () => {
    const missing = new Set<number>();
    if (q1.length === 0) missing.add(1);
    if (!q2) missing.add(2);
    if (!q3) missing.add(3);
    if (!q4) missing.add(4);
    if (!q5) missing.add(5);
    if (!q6) missing.add(6);
    return missing;
  };

  const handleSubmit = async () => {
    if (!pet) return;

    const missing = validate();
    if (missing.size > 0) {
      setInvalidQs(missing);
      setFormError(t('missingRequired'));
      const firstMissing = Math.min(...Array.from(missing)) as 1 | 2 | 3 | 4 | 5 | 6;
      questionRefs[firstMissing].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setInvalidQs(new Set());
    setFormError('');
    setSubmitting(true);

    // 1. Get the currently authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!authError && user && user.id === pet.rescuer_id) {
      setFormError(t('cantApplyOwn'));
      setSubmitting(false);
      return;
    }

    if (pet.is_hidden || (pet.review_status && pet.review_status !== 'approved')) {
      setFormError(t('listingUnavailable'));
      setSubmitting(false);
      return;
    }

    if (authError || !user) {
      router.push(`/login?next=${encodeURIComponent(`/apply/${pet.id}`)}`);
      setSubmitting(false);
      return;
    }

    // 2. Insert into the database, attaching the applicant_id
    const { error } = await supabase.from('applications').insert([{
      pet_id: pet.id,
      applicant_id: user.id, // Securely linking the application to the logged-in user
      q1: q1,
      q2: q2,
      q3: q3,
      q4: q4,
      q5: q5,
      q6: q6,
      q7: q7,
      status: 'pending'
    }]);

    if (!error) {
      router.push(`/apply/${pet.id}/thank-you`);
    } else {
      console.error(error);
      setFormError(t('submitError'));
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>{t('loading')}</div>;
  if (!pet) return <div style={{ padding: '60px', textAlign: 'center' }}>{t('notFound')}</div>;

  return (
    <>
      {/* Progress Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '24px 40px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)' }}>{t('step')}</div>
          </div>
          <div style={{ flex: 1, height: '2px', background: 'var(--border)', margin: '24px 16px 0' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '2px solid var(--border)', color: 'var(--light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</div>
          </div>
          <div style={{ flex: 1, height: '2px', background: 'var(--border)', margin: '24px 16px 0' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '2px solid var(--border)', color: 'var(--light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px 80px' }}>
        <Link href={`/pet/${pet.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--mid)', fontSize: '13px', textDecoration: 'none', padding: '16px 0', fontWeight: 500 }}>
          {t('backToProfile', { name: pet.name })}
        </Link>

        <main style={{ paddingTop: '32px' }}>
          <div className="q-header">
            <div>
              <h1 className="q-title-big">{t('title', { name: pet.name })}</h1>
              <p className="q-sub-big">{t('subtitle', { name: pet.name })}</p>
            </div>
            <div className="pet-thumb">
              <Image src={pet.image_url} alt={pet.name} width={120} height={120} sizes="120px" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div className="info-banner">
            <span className="info-banner-icon">❤</span>
            <span>{t('infoBanner', { name: pet.name })}<br/><strong>{t('noWrongAnswers')}</strong></span>
          </div>

          <div className={`question-block ${invalidQs.has(1) ? 'invalid' : ''}`} ref={questionRefs[1]}>
            <div className="q-num">{t('q1')}</div>
            <div className="q-opt-grid q-opt-4">
              {Q1_VALUES.map((opt, i) => (
                <button key={opt} className={`q-opt ${q1.includes(opt) ? 'selected' : ''}`} onClick={() => toggleQ1(opt)}>{q1Labels[i]}</button>
              ))}
            </div>
            {invalidQs.has(1) && <div className="field-error">{t('selectAtLeastOne')}</div>}
          </div>

          <div className={`question-block ${invalidQs.has(2) ? 'invalid' : ''}`} ref={questionRefs[2]}>
            <div className="q-num">{t('q2')}</div>
            <div className="q-opt-grid q-opt-4">
              {Q2_VALUES.map((opt, i) => (
                <button key={opt} className={`q-opt ${q2 === opt ? 'selected' : ''}`} onClick={() => setQ2(opt)}>{q2Labels[i]}</button>
              ))}
            </div>
            {invalidQs.has(2) && <div className="field-error">{t('chooseOption')}</div>}
          </div>

          <div className={`question-block ${invalidQs.has(5) ? 'invalid' : ''}`} ref={questionRefs[5]}>
            <div className="q-num">{t('q5')}</div>
            <div className="q-opt-grid q-opt-3">
              {Q5_VALUES.map((opt, i) => (
                <button key={opt} className={`q-opt ${q5 === opt ? 'selected' : ''}`} onClick={() => setQ5(opt)}>{q5Labels[i]}</button>
              ))}
            </div>
            {invalidQs.has(5) && <div className="field-error">{t('chooseOption')}</div>}
          </div>

          <div className={`question-block ${invalidQs.has(3) ? 'invalid' : ''}`} ref={questionRefs[3]}>
            <div className="q-num">{t('q3')}</div>
            <div className="q-opt-grid q-opt-4">
              {Q3_VALUES.map((opt, i) => (
                <button key={opt} className={`q-opt ${q3 === opt ? 'selected' : ''}`} onClick={() => setQ3(opt)}>{q3Labels[i]}</button>
              ))}
            </div>
            {invalidQs.has(3) && <div className="field-error">{t('chooseOption')}</div>}
          </div>

          <div className={`question-block ${invalidQs.has(4) ? 'invalid' : ''}`} ref={questionRefs[4]}>
            <div className="q-num">{t('q4')}</div>
            <div className="q-opt-grid q-opt-4">
              {Q4_VALUES.map((opt, i) => (
                <button key={opt} className={`q-opt ${q4 === opt ? 'selected' : ''}`} onClick={() => setQ4(opt)}>{q4Labels[i]}</button>
              ))}
            </div>
            {invalidQs.has(4) && <div className="field-error">{t('chooseOption')}</div>}
          </div>

          <div className={`question-block ${invalidQs.has(6) ? 'invalid' : ''}`} ref={questionRefs[6]}>
            <div className="q-num">{t('q6')}</div>
            <div className="q-opt-grid q-opt-4">
              {Q6_VALUES.map((opt, i) => (
                <button key={opt} className={`q-opt ${q6 === opt ? 'selected' : ''}`} onClick={() => setQ6(opt)}>{q6Labels[i]}</button>
              ))}
            </div>
            {invalidQs.has(6) && <div className="field-error">{t('chooseOption')}</div>}
          </div>

          <div className="question-block">
            <div className="q-num">{t('q7')}</div>
            <textarea className="textarea-field" value={q7} onChange={(e) => setQ7(e.target.value)} maxLength={500}></textarea>
            <div className="char-count">{t('charCount', { count: q7.length })}</div>
          </div>
        </main>
      </div>

      <div style={{ padding: '32px 40px', textAlign: 'center', borderTop: '1px solid var(--border)', background: '#fff' }}>
        {formError && <div className="form-error-banner" style={{ maxWidth: '460px', margin: '0 auto 20px' }}>{formError}</div>}
        <button onClick={handleSubmit} disabled={submitting} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '10px', padding: '16px 48px', fontSize: '16px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? t('submitting') : t('submit')}
        </button>
      </div>
    </>
  );
}
