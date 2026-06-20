'use client';
import '../dashboard/styles.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MessagesPanel from '@/components/MessagesPanel';
import DashboardTabs from '@/components/DashboardTabs';

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
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

      {userId ? (
        <MessagesPanel currentUserId={userId} />
      ) : (
        <p style={{ color: 'var(--mid)', fontSize: '13px' }}>Log in to view your messages.</p>
      )}
    </div>
  );
}
