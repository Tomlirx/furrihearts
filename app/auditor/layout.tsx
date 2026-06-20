import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import '../admin/styles.css';

const NAV_ITEMS = [
  { href: '/auditor', label: 'Listings Review' },
];

export default async function AuditorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('is_auditor').eq('id', user.id).single();
  if (!profile?.is_auditor) redirect('/');

  return (
    <div className="admin-layout">
      <aside className="admin-nav">
        <div className="admin-nav-title">Auditor Panel</div>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="admin-nav-link">{item.label}</Link>
        ))}
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
