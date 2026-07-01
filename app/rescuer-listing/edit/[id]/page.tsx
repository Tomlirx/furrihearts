'use client';
import '../../styles.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { getLaunchedStates } from '@/lib/locations';

const CAT_BREEDS = ['Domestic Shorthair', 'Domestic Longhair', 'Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Scottish Fold', 'Bengal', 'British Shorthair', 'Other'];
const DOG_BREEDS = ['Kampung Dog', 'Labrador Retriever', 'Golden Retriever', 'Poodle', 'Shih Tzu', 'Maltese', 'Corgi', 'Husky', 'Beagle', 'Dachshund', 'Schnauzer', 'Border Collie', 'Other'];

function healthFromPet(pet: any): string[] {
  const h: string[] = [];
  if (pet.is_vaccinated) h.push('Vaccinated');
  if (pet.is_dewormed) h.push('Dewormed');
  if (pet.is_flea_treated) h.push('Flea Treated');
  if (pet.is_neutered) h.push('Neutered');
  if (pet.is_potty_trained) h.push('Potty Trained');
  if (pet.is_parvo_tested) h.push('Parvo Tested');
  if (pet.is_giardia_tested) h.push('Giardia Tested');
  if (pet.is_fiv_tested) h.push('FIV Tested');
  if (pet.is_felv_tested) h.push('FeLV Tested');
  if (pet.is_fcov_tested) h.push('FCoV Tested');
  if (pet.is_heartworm_tested) h.push('Heartworm');
  return h;
}

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pet, setPet] = useState<any>(null);
  const [traitsWarning, setTraitsWarning] = useState(false);
  const [launchedStates, setLaunchedStates] = useState<string[]>(['Kuala Lumpur', 'Selangor', 'Penang', 'Johor']);
  const [saveError, setSaveError] = useState('');

  // Form fields
  const [petType, setPetType] = useState('cat');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Domestic Shorthair');
  const [customBreed, setCustomBreed] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('2–4 months');
  const [location, setLocation] = useState('Kuala Lumpur');
  const [fee, setFee] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [health, setHealth] = useState<string[]>([]);
  const [indoor, setIndoor] = useState('yes');
  const [description, setDescription] = useState('');

  useEffect(() => {
    getLaunchedStates(supabase).then(setLaunchedStates);
  }, []);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login?next=/dashboard'); return; }

      const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
      if (error || !data) { router.replace('/dashboard'); return; }
      if (data.rescuer_id !== user.id) { router.replace('/dashboard'); return; }

      setPet(data);
      setPetType(data.species || 'cat');
      setName(data.name || '');
      const breedVal = data.breed || 'Domestic Shorthair';
      const knownBreeds = data.species === 'dog' ? DOG_BREEDS : CAT_BREEDS;
      if (knownBreeds.includes(breedVal)) {
        setBreed(breedVal);
      } else {
        setBreed('Other');
        setCustomBreed(breedVal);
      }
      setGender(data.gender || '');
      setAge(data.age || '2–4 months');
      setLocation(data.location || 'Kuala Lumpur');
      setFee(data.fee != null ? String(data.fee) : '');
      setTraits(data.traits || []);
      setHealth(healthFromPet(data));
      setIndoor(data.is_strictly_indoor ? 'yes' : 'no');
      setDescription(data.description || '');
      setLoading(false);
    }
    load();
  }, [id]);

  const toggleTrait = (trait: string) => {
    if (traits.includes(trait)) {
      setTraits(traits.filter(t => t !== trait));
    } else {
      if (traits.length >= 3) { setTraitsWarning(true); setTimeout(() => setTraitsWarning(false), 800); return; }
      setTraits([...traits, trait]);
    }
  };

  const toggleHealth = (item: string) => {
    setHealth(health.includes(item) ? health.filter(h => h !== item) : [...health, item]);
  };

  const handleSave = async () => {
    if (!name.trim()) return setSaveError("Please enter the pet's name.");
    if (!gender) return setSaveError("Please select a gender.");
    setSaveError('');
    setIsSaving(true);

    const finalBreed = breed === 'Other' ? customBreed : breed;

    const { error } = await supabase.from('pets').update({
      name,
      species: petType,
      breed: finalBreed,
      gender,
      age,
      location,
      fee: Number(fee) || 0,
      traits,
      description,
      is_vaccinated: health.includes('Vaccinated'),
      is_dewormed: health.includes('Dewormed'),
      is_neutered: health.includes('Neutered'),
      is_flea_treated: health.includes('Flea Treated'),
      is_potty_trained: health.includes('Potty Trained'),
      is_parvo_tested: health.includes('Parvo Tested'),
      is_giardia_tested: health.includes('Giardia Tested'),
      is_fiv_tested: health.includes('FIV Tested'),
      is_felv_tested: health.includes('FeLV Tested'),
      is_fcov_tested: health.includes('FCoV Tested'),
      is_heartworm_tested: health.includes('Heartworm'),
      is_strictly_indoor: indoor === 'yes',
    }).eq('id', id);

    setIsSaving(false);
    if (error) {
      setSaveError('Failed to save changes. Please try again.');
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--mid)' }}>Loading...</div>;

  return (
    <main style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--mid)', fontSize: '13px', textDecoration: 'none', marginBottom: '24px', fontWeight: 500 }}>
          ← Back to Dashboard
        </Link>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
          {pet?.image_url && (
            <div style={{ width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
              <img src={pet.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={pet.name} />
            </div>
          )}
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Edit Listing</h1>
            <p style={{ fontSize: '13px', color: 'var(--mid)' }}>This listing is currently offline. Changes save immediately.</p>
          </div>
        </div>

        <div className="two-col">
          {/* LEFT COL */}
          <div className="col-left">
            <div className="section">
              <div className="section-label">Basic Info</div>

              <div className="form-field">
                <div className="field-label">Pet Type</div>
                <div className="gender-options">
                  <button className={`gender-opt ${petType === 'cat' ? 'selected' : ''}`} onClick={() => { setPetType('cat'); setBreed('Domestic Shorthair'); setCustomBreed(''); }}>Cat</button>
                  <button className={`gender-opt ${petType === 'dog' ? 'selected' : ''}`} onClick={() => { setPetType('dog'); setBreed('Kampung Dog'); setCustomBreed(''); }}>Dog</button>
                </div>
              </div>

              <div className="form-field">
                <div className="field-label">Breed</div>
                <select className="form-select" value={breed} onChange={e => setBreed(e.target.value)}>
                  {(petType === 'cat' ? CAT_BREEDS : DOG_BREEDS).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {breed === 'Other' && (
                  <input className="form-input" style={{ marginTop: '8px' }} value={customBreed} onChange={e => setCustomBreed(e.target.value)} placeholder="Please specify breed" />
                )}
              </div>

              <div className="form-field">
                <div className="field-label">Name</div>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Milo" />
              </div>

              <div className="form-field">
                <div className="field-label">Gender</div>
                <div className="gender-options">
                  <button className={`gender-opt ${gender === 'Male' ? 'selected' : ''}`} onClick={() => setGender('Male')}>Male</button>
                  <button className={`gender-opt ${gender === 'Female' ? 'selected' : ''}`} onClick={() => setGender('Female')}>Female</button>
                </div>
              </div>

              <div className="form-field">
                <div className="field-label">Age</div>
                <select className="form-select" value={age} onChange={e => setAge(e.target.value)}>
                  <option>Under 2 months</option><option>2–4 months</option><option>4–6 months</option><option>6–12 months</option><option>1–3 years</option><option>3–7 years</option><option>7+ years</option>
                </select>
              </div>

              <div className="form-field">
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div className="field-label" style={{ marginBottom: 0 }}>Personality & Traits</div>
                  <div style={{ fontSize: '11px', color: traitsWarning ? '#DC2626' : 'var(--light)', transition: 'color 0.2s' }}>Max 3 · {traits.length} selected</div>
                </div>
                <div className="health-options">
                  {['Playful', 'Gentle', 'Curious', 'People-Oriented', 'Shy', 'Independent', 'Pet Friendly'].map(t => (
                    <button key={t} className={`health-chip ${traits.includes(t) ? 'on' : ''}`} onClick={() => toggleTrait(t)}>{t}</button>
                  ))}
                  {petType === 'cat' && ['Lap Cat', 'Vocal'].map(t => (
                    <button key={t} className={`health-chip ${traits.includes(t) ? 'on' : ''}`} onClick={() => toggleTrait(t)}>{t}</button>
                  ))}
                  {petType === 'dog' && ['Calm', 'Protective', 'Loves Outdoors'].map(t => (
                    <button key={t} className={`health-chip ${traits.includes(t) ? 'on' : ''}`} onClick={() => toggleTrait(t)}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <div className="field-label">Location</div>
                <select className="form-select" value={location} onChange={e => setLocation(e.target.value)}>
                  {launchedStates.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-field">
                <div className="field-label">Adoption Fee (RM)</div>
                <div className="fee-input-wrap">
                  <span className="fee-prefix">RM</span>
                  <input className="form-input fee-input" type="number" placeholder="e.g. 150" value={fee} onChange={e => setFee(e.target.value)} style={{ paddingLeft: '40px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="col-right">
            <div className="section">
              <div className="section-label" style={{ marginBottom: '8px' }}>Description</div>
              <textarea
                className="form-input"
                style={{ minHeight: '140px', resize: 'vertical' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe this pet..."
              />
            </div>

            <div className="section">
              <div className="section-label" style={{ marginBottom: '10px' }}>Strictly Indoor Only?</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className={`health-chip ${indoor === 'yes' ? 'on' : ''}`} onClick={() => setIndoor('yes')}>Yes</button>
                <button className={`health-chip ${indoor === 'no' ? 'on' : ''}`} onClick={() => setIndoor('no')}>No</button>
              </div>
            </div>

            <div className="section">
              <div className="section-label">Health & Medical</div>
              <div className="health-options">
                {['Vaccinated', 'Dewormed', 'Flea Treated', 'Neutered', 'Potty Trained', 'Parvo Tested', 'Giardia Tested'].map(h => (
                  <button key={h} className={`health-chip ${health.includes(h) ? 'on' : ''}`} onClick={() => toggleHealth(h)}>{h}</button>
                ))}
                {petType === 'cat' && ['FIV Tested', 'FeLV Tested', 'FCoV Tested'].map(h => (
                  <button key={h} className={`health-chip ${health.includes(h) ? 'on' : ''}`} onClick={() => toggleHealth(h)}>{h}</button>
                ))}
                {petType === 'dog' && (
                  <button className={`health-chip ${health.includes('Heartworm') ? 'on' : ''}`} onClick={() => toggleHealth('Heartworm')}>Heartworm</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {saveError && (
          <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginTop: '16px' }}>
            {saveError}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{ width: '100%', marginTop: '24px', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </main>
  );
}
