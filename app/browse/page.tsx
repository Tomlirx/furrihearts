// app/browse/page.tsx
import './styles.css';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { getLaunchedStates } from '@/lib/locations';
import { IntlScope } from '@/components/IntlScope';
import BrowseContent from './BrowseContent';
import { Suspense } from 'react';

export default async function BrowsePage() {
  const supabase = await createClient();
  const launchedStates = await getLaunchedStates(supabase);
  const t = await getTranslations('Browse');

  return (
    <div className="browse-page-wrapper">
       {/* Suspense Boundary: REQUIRED by Next.js because BrowseContent uses useSearchParams */}
       <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>{t('loadingFallback')}</div>}>
         <IntlScope namespaces={['Browse', 'PetCard']}>
           <BrowseContent launchedStates={launchedStates} />
         </IntlScope>
       </Suspense>
    </div>
  );
}