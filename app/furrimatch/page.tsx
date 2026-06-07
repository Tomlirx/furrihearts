'use client';
import './styles.css';
import { useState } from 'react';
import Link from 'next/link';

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
           {/* ... your existing results render logic ... */}
        </div>
      )}
    </div>
  );
}