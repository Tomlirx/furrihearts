'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/my-applications', label: 'My Applications' },
  { href: '/manage-applications', label: 'Manage Applications' },
  { href: '/all-listings', label: 'Listings' },
  { href: '/messages', label: 'Messages' },
  { href: '/profile', label: 'Profile' },
];

export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="filter-tabs" style={{ marginBottom: '20px' }}>
      {TABS.map((tab) => {
        const isActive = tab.href === '/profile' ? pathname.startsWith('/profile') : pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} className={`filter-tab ${isActive ? 'active' : ''}`}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
