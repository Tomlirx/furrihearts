export const dynamic = 'force-dynamic';
import './styles.css';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getFeaturedPets } from '@/lib/pet-service';
import { getLaunchedStates } from '@/lib/locations';
import { createClient } from '@/utils/supabase/server';
import { HomeSearch } from '@/components/HomeSearch';
import PetCard from '@/components/PetCard';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { HowItWorksSteps } from '@/components/home/HowItWorksSteps';
import { IntlScope } from '@/components/IntlScope';

export default async function Home() {
  const supabase = await createClient();
  const featuredEntries = await getFeaturedPets(supabase, 4);
  const launchedStates = await getLaunchedStates(supabase);
  const t = await getTranslations('Homepage');
  const tPetCard = await getTranslations('PetCard');

  return (
    <>
      <HeroSection />

      <IntlScope namespaces={['HomeSearch']}>
        <HomeSearch launchedStates={launchedStates} />
      </IntlScope>

      <section className="featured-section">
        <div className="featured-inner">
          <div className="section-header">
            <div>
              <div className="section-tag">{t('featuredTag')}</div>
              <h2 className="section-title">{t.rich('featuredTitle', { em: (chunks) => <em>{chunks}</em> })}</h2>
            </div>
            <Link href="/browse" className="view-all-link">{t('viewAll')}</Link>
          </div>

          <div className="pets-grid">
            {featuredEntries.map(({ pet, isFeatured }) => (
              <PetCard
                key={pet.id}
                pet={pet}
                featured={isFeatured}
                adoptedLabel={tPetCard('adopted')}
                featuredLabel={tPetCard('featured')}
              />
            ))}
          </div>
        </div>
      </section>

      <FeatureGrid />
      <HowItWorksSteps />
    </>
  );
}
