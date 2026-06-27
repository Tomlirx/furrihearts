'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { getUnreadMessages, groupThreads, markAllMessagesRead } from '@/lib/messages-data';
import { signOutUser } from '@/app/actions/auth';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({ user, isAdmin = false, isAuditor = false }: { user: any; isAdmin?: boolean; isAuditor?: boolean }) {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const loginHref = pathname && pathname !== '/login' && pathname !== '/signup'
    ? `/login?next=${encodeURIComponent(pathname)}`
    : '/login';
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
      // Clear the browser client's own state, and separately clear the
      // server-readable httpOnly session cookie via a server action — the
      // browser client alone cannot clear that cookie.
      await supabase.auth.signOut();
      await signOutUser();
      window.location.href = '/';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <div className="top-ribbon">
        {t('ribbon')}
      </div>

      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">🐾</div>
            <span className="logo-text">Furri<span>Hearts</span></span>
          </Link>

          <div className="nav-links">
            <Link href="/browse">{t('adoptAPet')}</Link>
            <Link href="/guide">{t('adoptionGuide')}</Link>
            <Link href="/rescuer-landing">{t('forRescuers')}</Link>
          </div>

          <div className="nav-right">
            <LanguageSwitcher />
            <Link href="/rescuer-listing" className="btn-primary-nav">{t('listNow')}</Link>

            {user && (
              <div className="notif-wrap" ref={notifRef}>
                <button
                  type="button"
                  className="notif-btn"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  aria-haspopup="true"
                  aria-expanded={isNotifOpen}
                  aria-label={unreadCount > 0 ? t('unreadMessages', { count: unreadCount }) : t('notifications')}
                >
                  🔔
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                {isNotifOpen && (
                  <div className="notif-dropdown open" role="menu">
                    <div className="notif-header">
                      <span className="notif-header-title">{t('messagesHeader')}</span>
                      {unreadCount > 0 && (
                        <button className="notif-mark-read" onClick={handleMarkAllRead}>{t('markAllRead')}</button>
                      )}
                    </div>
                    {unreadThreads.length === 0 ? (
                      <div className="notif-item" style={{ color: 'var(--light)', fontSize: '13px' }}>{t('noNewMessages')}</div>
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
                      { href: '/dashboard', label: t('myDashboard') },
                      ...(isAdmin ? [{ href: '/admin', label: t('adminPanel') }] : []),
                      ...(isAuditor ? [{ href: '/auditor', label: t('auditorPanel') }] : []),
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
                      {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={loginHref} className="btn-ghost">{t('logIn')}</Link>
            )}

            {/* Hamburger Trigger */}
            <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)} aria-label={t('openMenu')} aria-expanded={isMobileMenuOpen}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div className={`mob-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mob-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="mob-panel">
          <button className="mob-close" onClick={() => setIsMobileMenuOpen(false)} aria-label={t('closeMenu')}>✕</button>

          <Link href="/browse" className="mob-link" onClick={() => setIsMobileMenuOpen(false)}>{t('adoptAPet')}</Link>
          <Link href="/guide" className="mob-link" onClick={() => setIsMobileMenuOpen(false)}>{t('adoptionGuide')}</Link>
          <Link href="/rescuer-landing" className="mob-link" onClick={() => setIsMobileMenuOpen(false)}>{t('forRescuers')}</Link>

          <LanguageSwitcher className="lang-switcher mob-lang-switcher" />

          {/* Mobile account links */}
          {user && (
            <>
              <Link href="/dashboard" className="mob-link" style={{ color: 'var(--orange)', fontWeight: 700 }} onClick={() => setIsMobileMenuOpen(false)}>
                {t('myDashboard')}
              </Link>
              {isAdmin && <Link href="/admin" className="mob-link" style={{ color: 'var(--orange)' }} onClick={() => setIsMobileMenuOpen(false)}>{t('adminPanel')}</Link>}
              {isAuditor && <Link href="/auditor" className="mob-link" style={{ color: 'var(--orange)' }} onClick={() => setIsMobileMenuOpen(false)}>{t('auditorPanel')}</Link>}
            </>
          )}

          <div className="mob-cta">
            <Link href="/rescuer-listing" className="mob-primary" style={{ background: 'var(--green)' }} onClick={() => setIsMobileMenuOpen(false)}>
              {t('listNow')}
            </Link>

            {user ? (
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="mob-danger"
              >
                {t('signOut')}
              </button>
            ) : (
              <Link href={loginHref} className="mob-primary" onClick={() => setIsMobileMenuOpen(false)}>
                {t('logIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}