// app/browse/page.tsx
import './styles.css';
import { createClient } from '@/utils/supabase/server';
import BrowseContent from './BrowseContent';
import { Suspense } from 'react';

export default async function BrowsePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Determine the user's role (Guest, Adopter, Rescuer)
  let role = 'guest';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role) {
      role = profile.role;
    }
  }

  return (
    <div className="browse-page-wrapper">
       {/* 2. Suspense Boundary: REQUIRED by Next.js because BrowseContent uses useSearchParams */}
       <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading furry friends...</div>}>
         <BrowseContent userRole={role} />
       </Suspense>
    </div>
  );
}