'use client';
import './styles.css';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { saveLocalListing } from '@/lib/local-store';
import { getLaunchedStates } from '@/lib/locations';

// Arrays for dynamic filtering
const CAT_BREEDS = ['Domestic Shorthair', 'Domestic Longhair', 'Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Scottish Fold', 'Bengal', 'British Shorthair', 'Other'];
const DOG_BREEDS = ['Kampung Dog', 'Labrador Retriever', 'Golden Retriever', 'Poodle', 'Shih Tzu', 'Maltese', 'Corgi', 'Husky', 'Beagle', 'Dachshund', 'Schnauzer', 'Border Collie', 'Other'];
const AI_DESCRIPTIONS = [
  "Milo is a friendly and curious young kitten who was found near a residential condo, where he quickly won everyone over with his playful personality. He loves following people around and is never short of affection to give. Despite his young age, he is confident, social, and settles in quickly with new surroundings. Milo is looking for a loving indoor home where he can grow up safe and cherished.",
  "Meet Milo — a cheerful little orange tabby with a big personality! Found exploring on his own, Milo immediately showed how social and trusting he is. He's playful, affectionate, and loves being around people. At just 2–4 months old, he's ready to grow up in a warm, loving home where he'll thrive with patience and care.",
  "Milo is a spirited young kitten full of energy and love. He was found near a condo and has been friendly from day one — following his foster carer everywhere and purring non-stop. He gets along well with other cats and would be a wonderful companion for anyone looking for a lively, affectionate addition to their family."
];

export default function RescuerListingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Upload
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Scanner Progress
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLabel, setScanLabel] = useState('Detecting animal type...');

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
  const [descIndex, setDescIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [traitsWarning, setTraitsWarning] = useState(false);

  useEffect(() => {
    getLaunchedStates(supabase).then(setLaunchedStates);
  }, []);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const MAX_SIZE_MB = 2;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
      const rawFiles = Array.from(e.target.files);
      const validFiles = rawFiles.filter(file => {
        if (file.size > MAX_SIZE_BYTES) {
          alert(`"${file.name}" is too large. Please upload photos under ${MAX_SIZE_MB}MB.`);
          return false;
        }
        return true;
      });
      setPhotos(prev => {
        const newFiles = validFiles.slice(0, 5 - prev.length);
        return [...prev, ...newFiles];
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const startScanning = () => {
    if (photos.length === 0) return;
    setStep(2);
    const scanSteps = [
      { label: 'Detecting animal type...', pct: 20 },
      { label: 'Estimating age and size...', pct: 40 },
      { label: 'Analysing coat colour...', pct: 60 },
      { label: 'Reading photo details...', pct: 80 },
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
      setDescription(AI_DESCRIPTIONS[descIndex % AI_DESCRIPTIONS.length]);
      setDescIndex(prev => prev + 1);
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
      });

      router.push(`/rescuer-listing/created?name=${encodeURIComponent(name || 'Your pet')}`);
      setIsSubmitting(false);
      return;
    }

    let primaryImageUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800';
    const allUploadedUrls: string[] = [];

    // 2. Upload Images to Storage
    if (photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error(`Error uploading photo ${i + 1}:`, uploadError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(fileName);

        allUploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    if (allUploadedUrls.length > 0) {
      primaryImageUrl = allUploadedUrls[0];
    }

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
      is_potty_trained: health.includes('Potty Trained')
    }]);

    if (!error) {
      router.push(`/rescuer-listing/created?name=${encodeURIComponent(name || 'Your pet')}`);
    } else {
      console.error("Database Error:", error);
      alert("Error publishing listing details.");
      setIsSubmitting(false);
    }
  };

  return (
      <main style={{ padding: step === 3 ? '40px 24px' : '48px 24px', display: 'flex', justifyContent: 'center' }}>
        
        {/* ======================= STEP 1 ======================= */}
        {step === 1 && (
          <div style={{ width: '100%', maxWidth: '540px' }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Upload your pet's photos 📸</h1>
            <p style={{ textAlign: 'center', color: 'var(--mid)', marginBottom: '32px' }}>Start by uploading up to <strong>5 clear photos</strong>.<br/>We'll take care of the rest.</p>
            
            <div className="upload-area" onClick={() => fileInputRef.current?.click()} style={{ padding: photos.length > 0 ? '16px' : '48px 32px' }}>
              <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleFileChange} />
              {photos.length === 0 && (
                <>
                  <div className="upload-icon">📷</div>
                  <div className="upload-label">Click to browse photos</div>
                  <div style={{ fontSize: '12px', color: 'var(--light)', marginTop: '12px' }}>JPG or PNG · Max 5 photos</div>
                </>
              )}
            </div>

            {photos.length > 0 && (
              <div className="photo-previews">
                {photos.map((photo, i) => (
                  <div key={i} className="photo-thumb-wrap">
                    <img src={URL.createObjectURL(photo)} className="photo-thumb" alt="preview" />
                    <button className="photo-remove" onClick={() => removePhoto(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {photos.length > 0 && (
              <button onClick={startScanning} style={{ width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
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
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Analysing your photos...</h1>
            <p style={{ fontSize: '14px', color: 'var(--light)', marginBottom: '28px' }}>Our AI is looking at your photos</p>
            <div className="progress-wrap"><div className="progress-bar" style={{ width: `${scanProgress}%` }}></div></div>
            <div style={{ fontSize: '12px', color: 'var(--light)' }}>{scanLabel}</div>
          </div>
        )}

        {/* ======================= STEP 3: FORM ======================= */}
        {step === 3 && (
          <div style={{ maxWidth: '700px', width: '100%' }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>Review & add details</h1>
            <p style={{ fontSize: '14px', color: 'var(--mid)', marginBottom: '28px', lineHeight: 1.6 }}>We've pre-filled what we could from your photos. Just check, tweak, and fill in anything we missed.</p>
            <div className="ai-badge">✨ AI pre-filled from your photos</div>

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
                    <div className="field-label">Breed <span className="ai-filled">AI</span></div>
                    <select className="form-select ai-value" value={breed} onChange={e => setBreed(e.target.value)}>
                      {(petType === 'cat' ? CAT_BREEDS : DOG_BREEDS).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {breed === 'Other' && (
                      <input className="form-input" style={{ marginTop: '8px' }} value={customBreed} onChange={e => setCustomBreed(e.target.value)} placeholder="Please specify breed" />
                    )}
                  </div>

                  <div className="form-field">
                    <div className="field-label">Name <span style={{fontSize: '11px', color: 'var(--light)', fontWeight: 400, textTransform: 'none'}}>(optional)</span></div>
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
                    <div className="field-label">Age <span className="ai-filled">AI</span></div>
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
                    {photos.map((p, i) => (
                      <div key={i} style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: i === 0 ? '2px solid var(--orange)' : 'none' }}>
                        <img src={URL.createObjectURL(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb"/>
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
                    {['Vaccinated', 'Dewormed', 'Flea Treated', 'Neutered', 'Potty Trained', 'Parvo', 'Giardia'].map(h => (
                      <button key={h} className={`health-chip ${health.includes(h) ? 'on' : ''}`} onClick={() => toggleHealth(h)}>{h}</button>
                    ))}
                    {petType === 'cat' && ['FIV Tested', 'FeLV Tested', 'FCoV'].map(h => (
                      <button key={h} className={`health-chip ${health.includes(h) ? 'on' : ''}`} onClick={() => toggleHealth(h)}>{h}</button>
                    ))}
                    {petType === 'dog' && ['Heartworm'].map(h => (
                      <button key={h} className={`health-chip ${health.includes(h) ? 'on' : ''}`} onClick={() => toggleHealth(h)}>{h}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!gender) return alert("Please select a gender (Male or Female).");
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
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 700, marginBottom: '24px' }}>Review & Publish 🎉</h1>
             
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{name || 'Unknown Pet'}</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <span style={{ background: 'var(--orange-pale)', color: 'var(--orange)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{breed === 'Other' ? customBreed : breed}</span>
                <span style={{ background: 'var(--green-pale)', color: 'var(--green)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{location}</span>
                <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{gender}</span>
                {/* NEW: Display selected traits in Review */}
  {traits.map(t => (
    <span key={t} style={{ background: '#F9FAFB', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: 'var(--mid)' }}>{t}</span>
  ))}
              </div>
              <p style={{ color: 'var(--mid)', lineHeight: 1.6 }}>{description || "No description provided."}</p>
            </div>

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
