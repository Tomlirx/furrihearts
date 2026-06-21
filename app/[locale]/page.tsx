export const dynamic = 'force-dynamic';
import '../styles.css';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getFeaturedPets } from '@/lib/pet-service';
import { getLaunchedStates } from '@/lib/locations';
import { createClient } from '@/utils/supabase/server';
import { HomeSearch } from '@/components/HomeSearch';
import PetCard from '@/components/PetCard';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { HowItWorksSteps } from '@/components/home/HowItWorksSteps';

export default async function Home() {
  const supabase = await createClient();
  const featuredEntries = await getFeaturedPets(supabase, 4);
  const launchedStates = await getLaunchedStates(supabase);
  const t = await getTranslations('Homepage');

  return (
    <>
      <HeroSection />

      <HomeSearch launchedStates={launchedStates} />

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
              <PetCard key={pet.id} pet={pet} featured={isFeatured} />
            ))}
          </div>
        </div>
      </section>

      <FeatureGrid />
      <HowItWorksSteps />
    </>
  );
}
