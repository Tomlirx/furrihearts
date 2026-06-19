'use client';
import './styles.css';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { localPets, type Pet } from '@/lib/pet-service';

export default function FurriMatch() {
  const [view, setView] = useState<'quiz' | 'results'>('quiz');
  // State tracks all 7 questions
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({ 3: [] });

  const handleRadio = (qId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleCheck = (qId: number, value: string) => {
    setAnswers(prev => {
      const current = (prev[qId] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [qId]: current.filter(v => v !== value) };
      }
      return { ...prev, [qId]: [...current, value] };
    });
  };

  const matches = useMemo(() => {
    return localPets
      .filter((pet) => pet.status === 'available')
      .map((pet) => ({ pet, score: scorePet(pet, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [answers]);

  return (
    <div className="furrimatch-container">
      {view === 'quiz' && (
        <div id="quiz-view">
          <div className="quiz-header">
            <h1 className="quiz-title">Find your <em>purrfect</em> match 🤍</h1>
            <p className="quiz-sub">Answer a few quick questions and we'll find pets that fit your lifestyle.</p>
          </div>
          
          <div className="quiz-body">
            {/* Question 1-3 */}
            <div className="q-section">
              <div className="q-block">
                <div className="q-label">1. What type of pet are you looking for?</div>
                <div className="q-options">
                  {['Cat 🐱', 'Dog 🐶', 'Either'].map(opt => (
                    <button key={opt} className={`q-radio ${answers[1] === opt ? 'selected' : ''}`} onClick={() => handleRadio(1, opt)}>{opt}</button>
                  ))}
                </div>
              </div>
              <div className="q-block">
                <div className="q-label">2. What type of home do you live in?</div>
                <div className="q-options">
                  {['Apartment / Condo', 'Landed House', 'Other'].map(opt => (
                    <button key={opt} className={`q-radio ${answers[2] === opt ? 'selected' : ''}`} onClick={() => handleRadio(2, opt)}>{opt}</button>
                  ))}
                </div>
              </div>
              <div className="q-block">
                <div className="q-label">3. Do you currently have any pets?</div>
                <div className="q-options">
                  {['None', 'Cat(s)', 'Dog(s)'].map(opt => {
                    const isSelected = (answers[3] as string[])?.includes(opt);
                    return (
                      <button key={opt} className={`q-check ${isSelected ? 'selected' : ''}`} onClick={() => handleCheck(3, opt)}>{opt}</button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Question 4-5 */}
            <div className="q-section">
              <div className="q-block">
                <div className="q-label">4. How much time will your pet spend alone each day?</div>
                <div className="q-options">
                  {['Rarely — mostly home', 'A few hours daily', 'Often — long hours away'].map(opt => (
                    <button key={opt} className={`q-radio ${answers[4] === opt ? 'selected' : ''}`} onClick={() => handleRadio(4, opt)}>{opt}</button>
                  ))}
                </div>
              </div>
              <div className="q-block">
                <div className="q-label">5. Have you owned a pet before?</div>
                <div className="q-options">
                  {['First-time owner', 'Yes, some experience', 'Quite experienced'].map(opt => (
                    <button key={opt} className={`q-radio ${answers[5] === opt ? 'selected' : ''}`} onClick={() => handleRadio(5, opt)}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question 6-7 */}
            <div className="q-section">
              <div className="q-block">
                <div className="q-label">6. How would you describe your lifestyle at home?</div>
                <div className="q-options">
                  {['Calm & quiet', 'Balanced', 'Active & outdoorsy'].map(opt => (
                    <button key={opt} className={`q-radio ${answers[6] === opt ? 'selected' : ''}`} onClick={() => handleRadio(6, opt)}>{opt}</button>
                  ))}
                </div>
              </div>
              <div className="q-block">
                <div className="q-label">7. What kind of bond are you looking for?</div>
                <div className="q-options">
                  {['Follows me everywhere', 'Affectionate & independent', 'Low-maintenance'].map(opt => (
                    <button key={opt} className={`q-radio ${answers[7] === opt ? 'selected' : ''}`} onClick={() => handleRadio(7, opt)}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setView('results')} className="btn-submit">See My Matches →</button>
          </div>
        </div>
      )}

      {/* RESULTS VIEW */}
      {view === 'results' && (
        <div id="results-view">
          <div className="results-header">
            <div>
              <h1 className="quiz-title" style={{ marginBottom: '6px' }}>Your FurriMatch results</h1>
              <p className="quiz-sub" style={{ marginBottom: 0 }}>These pets best match your home, lifestyle, and experience.</p>
            </div>
            <button className="q-radio" onClick={() => setView('quiz')}>Retake quiz</button>
          </div>

          <div className="match-grid">
            {matches.map(({ pet, score }, index) => (
              <Link href={`/pet/${pet.id}`} className="match-card" key={pet.id}>
                <div className="match-img">
                  <img src={pet.image_url} alt={pet.name} />
                  <span>{index === 0 ? 'Best Match' : `${score}% Match`}</span>
                </div>
                <div className="match-info">
                  <div className="match-title-row">
                    <h3>{pet.name}</h3>
                    <strong>{score}%</strong>
                  </div>
                  <p>{pet.gender} · {pet.age} · {pet.location}</p>
                  <div className="match-tags">
                    <span>{pet.breed}</span>
                    {pet.traits?.slice(0, 2).map((trait) => <span key={trait}>{trait}</span>)}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', padding: '8px 24px 56px' }}>
            <Link href="/browse" className="btn-submit" style={{ display: 'inline-block', width: 'auto', textDecoration: 'none', paddingLeft: '32px', paddingRight: '32px' }}>
              Browse All Pets
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function scorePet(pet: Pet, answers: Record<number, string | string[]>) {
  let score = 62;

  if (answers[1] === 'Cat 🐱' && pet.species === 'cat') score += 18;
  if (answers[1] === 'Dog 🐶' && pet.species === 'dog') score += 18;
  if (answers[1] === 'Either') score += 8;

  if (answers[2] === 'Apartment / Condo' && pet.species === 'cat') score += 8;
  if (answers[2] === 'Landed House' && pet.species === 'dog') score += 8;

  const currentPets = (answers[3] as string[]) || [];
  if (currentPets.includes('Cat(s)') && pet.traits?.includes('Pet Friendly')) score += 7;
  if (currentPets.includes('Dog(s)') && pet.traits?.includes('Pet Friendly')) score += 7;
  if (currentPets.includes('None') && (pet.traits?.includes('Gentle') || pet.traits?.includes('Calm'))) score += 6;

  if (answers[4] === 'Often — long hours away' && (pet.traits?.includes('Independent') || pet.traits?.includes('Low-Maintenance'))) score += 10;
  if (answers[4] === 'Rarely — mostly home' && pet.traits?.includes('People-Oriented')) score += 8;

  if (answers[5] === 'First-time owner' && (pet.traits?.includes('Gentle') || pet.traits?.includes('Calm'))) score += 8;
  if (answers[5] === 'Quite experienced' && (pet.traits?.includes('Active') || pet.traits?.includes('Shy'))) score += 6;

  if (answers[6] === 'Calm & quiet' && (pet.traits?.includes('Gentle') || pet.traits?.includes('Shy'))) score += 8;
  if (answers[6] === 'Active & outdoorsy' && (pet.traits?.includes('Active') || pet.traits?.includes('Loves Outdoors'))) score += 8;

  if (answers[7] === 'Follows me everywhere' && pet.traits?.includes('People-Oriented')) score += 8;
  if (answers[7] === 'Affectionate & independent' && pet.traits?.includes('Independent')) score += 8;
  if (answers[7] === 'Low-maintenance' && (pet.traits?.includes('Calm') || pet.traits?.includes('Low-Maintenance'))) score += 8;

  return Math.min(score, 98);
}
