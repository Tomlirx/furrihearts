export const dynamic = 'force-dynamic';
import './styles.css';
import Link from 'next/link';
import { getFeaturedPets } from '@/lib/pet-service';
import { createClient } from '@/utils/supabase/server';
import { HomeSearch } from '@/components/HomeSearch';
import PetCard from '@/components/PetCard';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { HowItWorksSteps } from '@/components/home/HowItWorksSteps';

export default async function Home() {
  const supabase = await createClient();
  const featuredEntries = await getFeaturedPets(supabase, 4);

  return (
    <>
      <HeroSection />

      <HomeSearch />

      <section className="featured-section">
        <div className="featured-inner">
          <div className="section-header">
            <div>
              <div className="section-tag">Featured Pets</div>
              <h2 className="section-title">Find your <em>purrfect</em> match 🐾</h2>
            </div>
            <Link href="/browse" className="view-all-link">View all pets →</Link>
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
