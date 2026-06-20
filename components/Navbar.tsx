'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getUnreadMessages, groupThreads, markAllMessagesRead } from '@/lib/messages-data';

export default function Navbar({ user, isAdmin = false, isAuditor = false }: { user: any; isAdmin?: boolean; isAuditor?: boolean }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadThreads, setUnreadThreads] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadUnread = async () => {
    if (!user) return;
    const unread = await getUnreadMessages(supabase, user.id);
    setUnreadCount(unread.length);
    setUnreadThreads(groupThreads(unread, user.id).slice(0, 5));
  };

  useEffect(() => {
    loadUnread();
    window.addEventListener('furrihearts:messages-read', loadUnread);
    return () => window.removeEventListener('furrihearts:messages-read', loadUnread);
  }, [user?.id]);

  useEffect(() => {
    if (!isDropdownOpen && !isNotifOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsNotifOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (isNotifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isNotifOpen]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllMessagesRead(supabase, user.id);
    loadUnread();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <div className="top-ribbon">
        🐾 Malaysia's #1 Pet Adoption Platform
      </div>

      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">🐾</div>
            <span className="logo-text">Furri<span>Hearts</span></span>
          </Link>

          <div className="nav-links">
            <Link href="/browse">Adopt a Pet</Link>
            <Link href="/guide">Adoption Guide</Link>
            <Link href="/rescuer-landing">For Rescuers</Link>
          </div>

          <div className="nav-right">
            <Link href="/rescuer-listing" className="btn-primary-nav">List Now</Link>

            {user && (
              <div className="notif-wrap" ref={notifRef}>
                <button
                  type="button"
                  className="notif-btn"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  aria-haspopup="true"
                  aria-expanded={isNotifOpen}
                  aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : 'Notifications'}
                >
                  🔔
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                {isNotifOpen && (
                  <div className="notif-dropdown open" role="menu">
                    <div className="notif-header">
                      <span className="notif-header-title">Messages</span>
                      {unreadCount > 0 && (
                        <button className="notif-mark-read" onClick={handleMarkAllRead}>Mark all read</button>
                      )}
                    </div>
                    {unreadThreads.length === 0 ? (
                      <div className="notif-item" style={{ color: 'var(--light)', fontSize: '13px' }}>No new messages.</div>
                    ) : (
                      unreadThreads.map((thread) => (
                        <Link
                          key={`${thread.otherId}-${thread.petId}`}
                          href="/messages"
                          className="notif-item unread"
                          onClick={() => setIsNotifOpen(false)}
                        >
                          <div className="notif-icon orange">💬</div>
                          <div>
                            <div className="notif-title">{thread.otherName} · {thread.petName}: {thread.latest.content.slice(0, 60)}{thread.latest.content.length > 60 ? '…' : ''}</div>
                            <div className="notif-time">{new Date(thread.latest.created_at).toLocaleString()}</div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                {/* Clickable Profile Chip */}
                <button
                  type="button"
                  className="profile-chip"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  style={{ cursor: 'pointer', font: 'inherit' }}
                >
                  <div className="profile-avatar">{user.email[0]?.toUpperCase()}</div>
                  <span className="profile-name">{user.email.split('@')[0]}</span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: '#fff', border: '1px solid var(--border)',
                      borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      zIndex: 500, padding: '8px', minWidth: '180px',
                      display: 'flex', flexDirection: 'column', gap: '4px'
                    }}>
                    {[
                      { href: '/dashboard', label: 'My Dashboard' },
                      ...(isAdmin ? [{ href: '/admin', label: '⚙️ Admin Panel' }] : []),
                      ...(isAuditor ? [{ href: '/auditor', label: '📋 Auditor Panel' }] : []),
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setIsDropdownOpen(false)}
                        className="dropdown-item"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>

                    {/* Existing Sign Out */}
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="dropdown-item dropdown-item-danger"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-ghost">Log in</Link>
            )}

            {/* Hamburger Trigger */}
            <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu" aria-expanded={isMobileMenuOpen}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div className={`mob-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mob-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="mob-panel">
          <button className="mob-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">✕</button>
          
          <Link href="/browse" className="mob-link" onClick={() => setIsMobileMenuOpen(false)}>Adopt a Pet</Link>
          <Link href="/guide" className="mob-link" onClick={() => setIsMobileMenuOpen(false)}>Adoption Guide</Link>
          <Link href="/rescuer-landing" className="mob-link" onClick={() => setIsMobileMenuOpen(false)}>For Rescuers</Link>
          
          {/* Mobile account links */}
          {user && (
            <>
              <Link href="/dashboard" className="mob-link" style={{ color: 'var(--orange)', fontWeight: 700 }} onClick={() => setIsMobileMenuOpen(false)}>
                My Dashboard
              </Link>
              {isAdmin && <Link href="/admin" className="mob-link" style={{ color: 'var(--orange)' }} onClick={() => setIsMobileMenuOpen(false)}>⚙️ Admin Panel</Link>}
              {isAuditor && <Link href="/auditor" className="mob-link" style={{ color: 'var(--orange)' }} onClick={() => setIsMobileMenuOpen(false)}>📋 Auditor Panel</Link>}
            </>
          )}

          <div className="mob-cta">
            <Link href="/rescuer-listing" className="mob-primary" style={{ background: 'var(--green)' }} onClick={() => setIsMobileMenuOpen(false)}>
              List Now
            </Link>
            
            {user ? (
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                className="mob-danger"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="mob-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}