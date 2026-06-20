'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getPlatformStats, type PlatformStats } from '@/lib/pet-service';
import './styles.css';

export default function RescuerLanding() {
  const [activeTab, setActiveTab] = useState<'rescuer' | 'adopter'>('rescuer');
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    getPlatformStats(supabase).then(setStats);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="rl-hero">
        <div className="rl-hero-inner">
          <div className="hero-tag">For Rescuers</div>
          <h1 className="hero-title">Rehome with <em>Heart</em> 🐾</h1>
          <p className="hero-sub">
            FurriHearts helps rescuers like you find the perfect forever home for every cat — with smart tools, AI-assisted listings, and a community that cares.
          </p>
          <div className="hero-btns">
            <Link href="/rescuer-listing" className="btn-hero">✨ Start Your First Listing</Link>
          </div>
          <div className="hero-stats">
            {stats && stats.activeRescuers > 0 ? (
              <>
                <div><div className="hero-stat-num">{stats.activeRescuers}</div><div className="hero-stat-label">Active Rescuers</div></div>
                <div><div className="hero-stat-num">{stats.successfulAdoptions}</div><div className="hero-stat-label">Successful Adoptions</div></div>
              </>
            ) : (
              <>
                <div><div className="hero-stat-num">RM0</div><div className="hero-stat-label">Hidden Fees</div></div>
                <div><div className="hero-stat-num">🇲🇾</div><div className="hero-stat-label">Made for Malaysia</div></div>
              </>
            )}
            <div><div className="hero-stat-num">Free</div><div className="hero-stat-label">Always Free to List</div></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="rl-features">
        <div className="rl-features-inner">
          <div className="section-tag">FEATURES</div>
          <h2 className="section-title">Everything you need to <em>rehome with ease</em></h2>
          <p className="section-sub">Built for rescuers, by people who love animals.</p>
          
          <div className="rl-features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <div className="feature-title">AI-Assisted Listings</div>
              <p className="feature-desc">Upload photos and fill in a few details — our AI writes a beautiful, compelling adoption post for you.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <div className="feature-title">Smart Application Management</div>
              <p className="feature-desc">Review adopter applications, filter by compatibility, and communicate easily — all in one place.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏅</div>
              <div className="feature-title">Verified Rescuer Badge</div>
              <p className="feature-desc">Get verified to build trust with adopters. Verified rescuers get 3x more applications.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-title">Dashboard & Analytics</div>
              <p className="feature-desc">Track your listings, monitor application statuses, and measure your adoption impact over time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <div className="feature-title">Boost Your Listing</div>
              <p className="feature-desc">Feature a pet on the homepage for 7–30 days from as little as RM15, so more adopters see it first.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how" id="how">
        <div className="how-inner">
          <div className="section-tag" style={{ textAlign: 'center' }}>HOW IT WORKS</div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 40px' }}>
            <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '30px', padding: '4px', display: 'flex', gap: '4px' }}>
              <button onClick={() => setActiveTab('rescuer')} style={{ background: activeTab === 'rescuer' ? 'var(--orange)' : 'transparent', color: activeTab === 'rescuer' ? '#fff' : 'var(--mid)', border: 'none', borderRadius: '24px', padding: '10px 28px', fontSize: '14px', fontWeight: activeTab === 'rescuer' ? 700 : 500, cursor: 'pointer', transition: 'all .2s' }}>
                🏅 For Rescuers
              </button>
              <button onClick={() => setActiveTab('adopter')} style={{ background: activeTab === 'adopter' ? 'var(--orange)' : 'transparent', color: activeTab === 'adopter' ? '#fff' : 'var(--mid)', border: 'none', borderRadius: '24px', padding: '10px 28px', fontSize: '14px', fontWeight: activeTab === 'adopter' ? 700 : 500, cursor: 'pointer', transition: 'all .2s' }}>
                🐱 For Adopters
              </button>
            </div>
          </div>

          {activeTab === 'rescuer' && (
            <div id="steps-rescuer">
              <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-fraunces)', fontSize: '34px', fontWeight: 700, marginBottom: '40px' }}>
                Simple steps to a <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>successful rehoming</em>
              </h2>
              <div className="how-steps">
                <div className="how-step"><div className="how-step-num">1</div><h3>Create a Listing</h3><p>Upload photos, add basic details, and let our AI generate a compelling adoption profile in seconds.</p></div>
                <div className="how-step"><div className="how-step-num">2</div><h3>Review Applications</h3><p>Receive and review adopter questionnaires. Filter by compatibility scores and communicate directly.</p></div>
                <div className="how-step"><div className="how-step-num">3</div><h3>Approve & Connect</h3><p>Approve your chosen adopter, arrange a meet-up, and celebrate a successful rehoming! 🎉</p></div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link href="/rescuer-listing" className="btn-hero">Start Your First Listing →</Link>
              </div>
            </div>
          )}

          {activeTab === 'adopter' && (
            <div id="steps-adopter">
              <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-fraunces)', fontSize: '34px', fontWeight: 700, marginBottom: '40px' }}>
                Simple steps to finding your <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>purrfect match</em>
              </h2>
              <div className="how-steps">
                <div className="how-step"><div className="how-step-num" style={{ background: 'var(--green)' }}>1</div><h3>Find Your Match</h3><p>Browse pets to find a cat that truly fits your lifestyle and home.</p></div>
                <div className="how-step"><div className="how-step-num" style={{ background: 'var(--green)' }}>2</div><h3>Apply to Adopt</h3><p>Submit a short questionnaire — your profile info is automatically included so it only takes minutes.</p></div>
                <div className="how-step"><div className="how-step-num" style={{ background: 'var(--green)' }}>3</div><h3>Welcome Home</h3><p>Once approved, arrange collection with the rescuer and bring your new family member home! 🏠</p></div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link href="/browse" className="btn-hero" style={{ background: 'var(--green)' }}>🐾 Browse Pets →</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof">
        <div className="social-inner">
          <div className="section-tag">RESCUER STORIES</div>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-fraunces)', fontSize: '36px', fontWeight: 700, textAlign: 'center' }}>
            Rescuers love <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>FurriHearts</em>
          </h2>
          <div className="proof-grid">
            <div className="proof-card">
              <div className="proof-avatar">👩</div>
              <p className="proof-quote">"FurriHearts has transformed how I rehome my rescues. The AI listing tool saves me hours every week and the applications are so much more organised now."</p>
              <div className="proof-name">Sheryl Ng</div>
              <div className="proof-role">Independent Rescuer · KL</div>
            </div>
            {/* ... remaining cards ... */}
          </div>
        </div>
      </section>
    </>
  );
}