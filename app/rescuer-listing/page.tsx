'use client';
import './styles.css';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { saveLocalListing } from '@/lib/local-store';
import { getLaunchedStates } from '@/lib/locations';
import { usePhotoManager, displayUrl } from '@/lib/use-photo-manager';
import { uploadPhotoBlob } from '@/lib/image-crop';
import PhotoManager from '@/components/listing/PhotoManager';
import { Camera } from '@/components/icons';

// Arrays for dynamic filtering
const CAT_BREEDS = ['Domestic Shorthair', 'Domestic Longhair', 'Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Scottish Fold', 'Bengal', 'British Shorthair', 'Other'];
const DOG_BREEDS = ['Kampung Dog', 'Labrador Retriever', 'Golden Retriever', 'Poodle', 'Shih Tzu', 'Maltese', 'Corgi', 'Husky', 'Beagle', 'Dachshund', 'Schnauzer', 'Border Collie', 'Other'];
function buildDescription({ name, petType, breed, gender, age, traits, indoor }: {
  name: string; petType: string; breed: string; gender: string; age: string; traits: string[]; indoor: string;
}) {
  const petName = name || (petType === 'cat' ? 'This cat' : 'This dog');
  const pronoun = gender === 'Male' ? 'He' : gender === 'Female' ? 'She' : 'They';
  const possessive = gender === 'Male' ? 'his' : gender === 'Female' ? 'her' : 'their';

  const openings = [
    `${petName} is a ${age} ${breed} looking for a loving home.`,
    `Meet ${petName}, a ${age} ${breed} ready for a fresh start.`,
    `${petName} is a ${breed} around ${age} old, hoping to find a forever family.`,
  ];

  let personality: string;
  if (traits.length > 0) {
    const traitList = traits.map((t) => t.toLowerCase());
    const joined = traitList.length === 1
      ? traitList[0]
      : `${traitList.slice(0, -1).join(', ')} and ${traitList[traitList.length - 1]}`;
    const personalityOptions = [
      `${pronoun} is known for being ${joined}.`,
      `${petName} is ${joined} — the kind of companion who makes a house feel like home.`,
      `Foster carers describe ${possessive} personality as ${joined}.`,
    ];
    personality = personalityOptions[Math.floor(Math.random() * personalityOptions.length)];
  } else {
    personality = `${pronoun} is still settling in, and ${possessive} full personality is waiting to be discovered by the right family.`;
  }

  const closings = indoor === 'yes' ? [
    `${petName} does best as a strictly indoor pet and would love a safe, comfortable home to settle into.`,
    `Looking for a quiet, indoor-only home where ${pronoun.toLowerCase()} can feel safe and loved.`,
  ] : [
    `${petName} would thrive with a family that can give ${possessive} space to roam and explore safely.`,
    `With access to the outdoors and a loving family, ${petName} would settle in beautifully.`,
  ];

  const cta = [
    `Could ${petName} be the newest member of your family?`,
    `Reach out today to learn more about adopting ${petName}.`,
    `${petName} is ready to meet ${possessive} new family — could that be you?`,
  ];

  return [
    openings[Math.floor(Math.random() * openings.length)],
    personality,
    closings[Math.floor(Math.random() * closings.length)],
    cta[Math.floor(Math.random() * cta.length)],
  ].join(' ');
}

export default function RescuerListingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Upload
  const { photos, primaryId, addFiles, removePhoto, setPrimary, applyCrop, orderedPhotos } = usePhotoManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const primaryPhoto = photos.find(p => p.id === primaryId) ?? photos[0];

  // Step 2: Scanner Progress
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLabel, setScanLabel] = useState('Getting your form ready...');

  // Step 3: Form Data
  const [petType, setPetType] = useState('cat');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Domestic Shorthair');
  const [customBreed, setCustomBreed] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('2–4 months');
  const [location, setLocation] = useState('Kuala Lumpur');
  const [launchedStates, setLaunchedStates] = useState<string[]>(['Kuala Lumpur', 'Selangor', 'Penang', 'Johor']);
  const [fee, setFee] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [health, setHealth] = useState<string[]>([]);
  const [indoor, setIndoor] = useState('yes');
  const [description, setDescription] = useState('');
  
  // UI State for Step 3
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [traitsWarning, setTraitsWarning] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    getLaunchedStates(supabase).then(setLaunchedStates);
  }, []);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startScanning = () => {
    if (photos.length === 0) return;
    setStep(2);
    const scanSteps = [
      { label: 'Uploading your photos...', pct: 20 },
      { label: 'Setting up the details form...', pct: 40 },
      { label: 'Adding common defaults you can edit...', pct: 60 },
      { label: 'Preparing your preview...', pct: 80 },
      { label: 'Almost done!', pct: 100 },
    ];
    let currentScan = 0;
    const interval = setInterval(() => {
      if (currentScan >= scanSteps.length) {
        clearInterval(interval);
        setTimeout(() => setStep(3), 1500);
      } else {
        setScanProgress(scanSteps[currentScan].pct);
        setScanLabel(scanSteps[currentScan].label);
        currentScan++;
      }
    }, 800);
  };

  const handlePetTypeChange = (type: string) => {
    setPetType(type);
    setBreed(type === 'cat' ? 'Domestic Shorthair' : 'Kampung Dog');
    setCustomBreed('');
    setTraits([]);
    setHealth([]); 
  };

  const toggleTrait = (trait: string) => {
    if (traits.includes(trait)) {
      setTraits(traits.filter(t => t !== trait));
    } else {
      if (traits.length >= 3) {
        setTraitsWarning(true);
        setTimeout(() => setTraitsWarning(false), 800);
        return;
      }
      setTraits([...traits, trait]);
    }
  };

  const toggleHealth = (item: string) => {
    setHealth(health.includes(item) ? health.filter(h => h !== item) : [...health, item]);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDescription(buildDescription({
        name,
        petType,
        breed: breed === 'Other' ? customBreed : breed,
        gender,
        age,
        traits,
        indoor,
      }));
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1200);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);

    // 1. Authenticate the User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      const finalBreed = breed === 'Other' ? customBreed : breed;
      const fallbackImage = petType === 'cat' ? '/img-milo.png' : '/img-buddy.png';

      saveLocalListing({
        id: `local-${Date.now()}`,
        name: name || 'New Rescue Pet',
        species: petType,
        breed: finalBreed || 'Mixed Breed',
        age,
        gender,
        location,
        description: description || 'This pet was added locally from the rescuer listing flow.',
        status: 'available',
        image_url: fallbackImage,
        gallery: [fallbackImage],
        fee: Number(fee) || 0,
        rescuer_id: 'demo-rescuer',
        rescuer_name: 'Demo Rescuer',
        traits,
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
      });

      router.push(`/rescuer-listing/created?name=${encodeURIComponent(name || 'Your pet')}`);
      setIsSubmitting(false);
      return;
    }

    const allUploadedUrls: string[] = [];

    // 2. Upload Images to Storage (primary photo first, cropped version if adjusted)
    for (const photo of orderedPhotos()) {
      const body = photo.croppedBlob ?? photo.originalFile;
      if (!body) continue;
      const ext = photo.croppedBlob ? 'jpg' : (photo.originalFile!.name.split('.').pop() || 'jpg');
      const contentType = photo.croppedBlob ? 'image/jpeg' : undefined;
      const url = await uploadPhotoBlob(supabase, body, ext, contentType);
      if (url) allUploadedUrls.push(url);
    }

    // Never publish a real listing with a stock/placeholder photo — require at
    // least one real upload to succeed.
    if (allUploadedUrls.length === 0) {
      setFormError('We could not upload your photos. Please check your connection and try again.');
      setIsSubmitting(false);
      return;
    }
    const primaryImageUrl = allUploadedUrls[0];

    const finalBreed = breed === 'Other' ? customBreed : breed;
    
    // 3. Insert Data into Supabase
    const { error } = await supabase.from('pets').insert([{
      name: name || 'Unknown',
      species: petType,
      breed: finalBreed,
      age: age,
      gender: gender,
      location: location,
      description: description,
      status: 'available',
      review_status: 'pending',
      image_url: primaryImageUrl,
      gallery: allUploadedUrls,
      fee: Number(fee) || 0,
      rescuer_id: user.id,
      // --- ADD THESE NEW FIELDS ---
      traits: traits,
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
    }]);

    if (!error) {
      router.push(`/rescuer-listing/created?name=${encodeURIComponent(name || 'Your pet')}`);
    } else {
      console.error("Database Error:", error);
      setFormError('Something went wrong while publishing. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
      <main style={{ padding: step === 3 ? '40px 24px' : '48px 24px', display: 'flex', justifyContent: 'center' }}>
        
        {/* ======================= STEP 1 ======================= */}
        {step === 1 && (
          <div style={{ width: '100%', maxWidth: '540px' }}>
            <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Upload your pet's photos 📸</h1>
            <p style={{ textAlign: 'center', color: 'var(--mid)', marginBottom: '32px' }}>Start by uploading up to <strong>5 clear photos</strong>.<br/>We'll take care of the rest.</p>
            
            <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} />
            {photos.length === 0 && (
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon" style={{ color: 'var(--orange)' }}><Camera size={48} strokeWidth={1.5} /></div>
                <div className="upload-label">Click to browse photos</div>
                <div style={{ fontSize: '12px', color: 'var(--light)', marginTop: '12px' }}>JPG or PNG · Max 5 photos</div>
              </div>
            )}

            <PhotoManager
              photos={photos}
              primaryId={primaryId}
              onAddClick={() => fileInputRef.current?.click()}
              onRemove={removePhoto}
              onSetPrimary={setPrimary}
              onApplyCrop={applyCrop}
            />

            {photos.length > 0 && (
              <button onClick={startScanning} style={{ width: '100%', marginTop: '20px', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Continue →
              </button>
            )}
          </div>
        )}

        {/* ======================= STEP 2 ======================= */}
        {step === 2 && (
          <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
            <div className="photo-strip">
              <div className="photo-mock">🐱<div className="scan-line" style={{ top: `${scanProgress}%` }}></div></div>
              <div className="photo-mock">🐱<div className="scan-line" style={{ top: `${scanProgress}%` }}></div></div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Preparing your listing...</h1>
            <p style={{ fontSize: '14px', color: 'var(--light)', marginBottom: '28px' }}>Setting up a head start you can edit</p>
            <div className="progress-wrap"><div className="progress-bar" style={{ width: `${scanProgress}%` }}></div></div>
            <div style={{ fontSize: '12px', color: 'var(--light)' }}>{scanLabel}</div>
          </div>
        )}

        {/* ======================= STEP 3: FORM ======================= */}
        {step === 3 && (
          <div style={{ maxWidth: '700px', width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>Review & add details</h1>
            <p style={{ fontSize: '14px', color: 'var(--mid)', marginBottom: '28px', lineHeight: 1.6 }}>We've filled in some common defaults to save you time. Please check every field, tweak what's off, and add anything we couldn't guess.</p>
            <div className="ai-badge">✨ Smart pre-fill — please review</div>

            <div className="two-col">
              
              {/* LEFT COL (Basic Info) */}
              <div className="col-left">
                <div className="section">
                  <div className="section-label">Basic Info</div>
                  
                  <div className="form-field">
                    <div className="field-label">Pet Type</div>
                    <div className="gender-options">
                      <button className={`gender-opt ${petType === 'cat' ? 'selected' : ''}`} onClick={() => handlePetTypeChange('cat')}>Cat</button>
                      <button className={`gender-opt ${petType === 'dog' ? 'selected' : ''}`} onClick={() => handlePetTypeChange('dog')}>Dog</button>
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="field-label">Breed <span className="ai-filled">Suggested</span></div>
                    <select className="form-select ai-value" value={breed} onChange={e => setBreed(e.target.value)}>
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
                    <select className="form-select ai-value" value={age} onChange={e => setAge(e.target.value)}>
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
                      {launchedStates.map((state) => (
                        <option key={state}>{state}</option>
                      ))}
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

              {/* RIGHT COL (Photos + Description + Health) */}
              <div className="col-right">
                
                {/* Photo Previews */}
                <div className="section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>Photos <span className="ai-filled">{photos.length} of 5</span></div>
                    <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--orange)', fontWeight: 600, cursor: 'pointer' }}>+ Add more</button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {photos.map(p => (
                      <div key={p.id} style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: p.id === primaryId ? '2px solid var(--orange)' : 'none' }}>
                        <img src={displayUrl(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb"/>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description Box */}
                <div className="section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>Tell us about this pet</div>
                    <button onClick={handleGenerate} style={{ background: hasGenerated ? '#fff' : 'var(--orange)', color: hasGenerated ? 'var(--mid)' : '#fff', border: hasGenerated ? '1.5px solid var(--border)' : 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {isGenerating ? '✨ Generating...' : hasGenerated ? '↺ Regenerate' : '✨ Generate'}
                    </button>
                  </div>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '140px', resize: 'vertical', borderColor: hasGenerated ? 'var(--orange)' : 'var(--border)' }} 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Found near my condo, very friendly..."
                  />
                </div>

                {/* Indoor Only Toggle */}
                <div className="section">
                  <div className="section-label" style={{ marginBottom: '10px' }}>Strictly Indoor Only?</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={`health-chip ${indoor === 'yes' ? 'on' : ''}`} onClick={() => setIndoor('yes')}>Yes</button>
                    <button className={`health-chip ${indoor === 'no' ? 'on' : ''}`} onClick={() => setIndoor('no')}>No</button>
                  </div>
                </div>

                {/* Health Box */}
                <div className="section">
                  <div className="section-label">Health & Medical</div>
                  <div className="health-options">
                    {['Vaccinated', 'Dewormed', 'Flea Treated', 'Neutered', 'Potty Trained', 'Parvo Tested', 'Giardia Tested'].map(h => (
                      <button key={h} className={`health-chip ${health.includes(h) ? 'on' : ''}`} onClick={() => toggleHealth(h)}>{h}</button>
                    ))}
                    {petType === 'cat' && ['FIV Tested', 'FeLV Tested', 'FCoV Tested'].map(h => (
                      <button key={h} className={`health-chip ${health.includes(h) ? 'on' : ''}`} onClick={() => toggleHealth(h)}>{h}</button>
                    ))}
                    {petType === 'dog' && ['Heartworm'].map(h => (
                      <button key={h} className={`health-chip ${health.includes(h) ? 'on' : ''}`} onClick={() => toggleHealth(h)}>{h}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '12px' }}>{formError}</div>
            )}
            <button
              onClick={() => {
                if (!name.trim()) { setFormError("Please enter the pet's name."); return; }
                if (!gender) { setFormError('Please select a gender (Male or Female).'); return; }
                setFormError('');
                setStep(4);
              }}
              style={{ width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
            >
              Generate My Listing →
            </button>
          </div>
        )}

        {/* ======================= STEP 4: REVIEW ======================= */}
        {step === 4 && (
          <div style={{ maxWidth: '760px', width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '26px', fontWeight: 700, marginBottom: '24px' }}>Review & Publish 🎉</h1>
             
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px', overflow: 'hidden' }}>
              {primaryPhoto && (
                <div style={{ width: '100%', height: '220px' }}>
                  <img src={displayUrl(primaryPhoto)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                </div>
              )}
              <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{name || 'Unknown Pet'}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ background: 'var(--orange-pale)', color: 'var(--orange)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{breed === 'Other' ? customBreed : breed}</span>
                  <span style={{ background: 'var(--green-pale)', color: 'var(--green)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{location}</span>
                  <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{gender}</span>
                  {traits.map(t => (
                    <span key={t} style={{ background: '#F9FAFB', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: 'var(--mid)' }}>{t}</span>
                  ))}
                </div>
                <p style={{ color: 'var(--mid)', lineHeight: 1.6, marginBottom: health.length > 0 ? '16px' : 0 }}>{description || "No description provided."}</p>
                {health.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {health.map(h => (
                      <span key={h} style={{ background: 'var(--green-pale)', color: 'var(--green)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>✓ {h}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {formError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '12px' }}>{formError}</div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '16px', fontWeight: 600, cursor: 'pointer' }}>
                Back to Edit
              </button>
              <button onClick={handlePublish} disabled={isSubmitting} style={{ flex: 2, background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontWeight: 700, cursor: 'pointer' }}>
                {isSubmitting ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        )}
      </main>
  );
}
