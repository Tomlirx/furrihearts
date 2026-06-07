'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar({ user, roles = [] }: { user: any, roles?: string[] }) {
  const isRescuer = (roles ?? []).includes('rescuer');
  
  // State to manage the profile dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

 // Replace your existing handleLogout with this clean version
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // No more manual localStorage/cookie clearing needed.
      // A simple reload is sufficient to update the UI.
      window.location.href = '/';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <div className="top-ribbon">
        🐾 Malaysia's #1 Pet Adoption Platform &nbsp;·&nbsp; 
        <Link href="/furrimatch">Take the FurriMatch Quiz →</Link>
      </div>

      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">🐾</div>
            <span className="logo-text">Furri<span>Hearts</span></span>
          </Link>

          <div className="nav-links">
            <Link href="/browse">Adopt a Pet</Link>
            <Link href="/furrimatch">FurriMatch</Link>
            <Link href="/guide">Adoption Guide</Link>
            <Link href="/rescuer-landing">For Rescuers</Link>
          </div>

          <div className="nav-right">
            <Link href="/rescuer-listing" className="btn-primary-nav">List Now</Link>

            {user ? (
              <div style={{ position: 'relative' }}>
                {/* Clickable Profile Chip */}
                <div 
                  className="profile-chip" 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="profile-avatar">{user.email[0]?.toUpperCase()}</div>
                  <span className="profile-name">{user.email.split('@')[0]}</span>
                  {isRescuer && <span className="dd-badge">Rescuer</span>}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    zIndex: 500,
                    padding: '8px',
                    minWidth: '160px'
                  }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#DC2626',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-ghost">Log in</Link>
            )}

            <button className="hamburger">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}