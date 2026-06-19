import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import './styles.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/pets', label: 'Pets' },
  { href: '/admin/applications', label: 'Applications' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/contact', label: 'Contact Messages' },
  { href: '/admin/boosts', label: 'Boosts' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) redirect('/');

  return (
    <div className="admin-layout">
      <aside className="admin-nav">
        <div className="admin-nav-title">Admin Panel</div>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="admin-nav-link">{item.label}</Link>
        ))}
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
