'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ user, roles = [] }: { user: any, roles?: string[] }) {
  const isRescuer = (roles ?? []).includes('rescuer');

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
              <div className="profile-chip">
                <div className="profile-avatar">{user.email[0]?.toUpperCase()}</div>
                <span className="profile-name">{user.email.split('@')[0]}</span>
                {isRescuer && <span className="dd-badge">Rescuer</span>}
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