'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FollowButton({ rescuerId, initialFollowing }: { rescuerId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (following) {
      await supabase.from('rescuer_follows').delete().eq('follower_id', user.id).eq('rescuer_id', rescuerId);
    } else {
      await supabase.from('rescuer_follows').insert({ follower_id: user.id, rescuer_id: rescuerId });
    }
    setFollowing(!following);
    setLoading(false);
  };

  return (
    <button className={`btn-follow ${following ? 'following' : ''}`} onClick={toggleFollow} disabled={loading}>
      {following ? '✓ Following' : '+ Follow'}
    </button>
  );
}
