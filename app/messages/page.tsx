'use client';
import '../dashboard/styles.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getClientLocale, localeHref } from '@/lib/locale';
import MessagesPanel from '@/components/MessagesPanel';
import DashboardTabs from '@/components/DashboardTabs';

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`${localeHref('/login', getClientLocale())}?next=/messages`); return; }
      setUserId(user.id);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="loading-state">Loading messages...</div>;

  return (
    <div className="dashboard-container">
      <DashboardTabs />
      <div className="dashboard-header">
        <div><h1>Messages</h1><p>Conversations with adopters and rescuers about pets.</p></div>
      </div>

      <MessagesPanel currentUserId={userId!} />
    </div>
  );
}
