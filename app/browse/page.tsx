// app/browse/page.tsx
import './styles.css';
import { createClient } from '@/utils/supabase/server';
import BrowseContent from './BrowseContent';
import { Suspense } from 'react';

export default async function BrowsePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="browse-page-wrapper">
       {/* Suspense Boundary: REQUIRED by Next.js because BrowseContent uses useSearchParams */}
       <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading furry friends...</div>}>
         <BrowseContent isLoggedIn={!!user} />
       </Suspense>
    </div>
  );
}