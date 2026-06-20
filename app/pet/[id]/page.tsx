'use client';

import './styles.css';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fetchPetById, findLocalPetById, isPetCurrentlyFeatured, type Pet } from '@/lib/pet-service';
import { getLocalApplications } from '@/lib/local-store';
import { Skeleton, SkeletonText } from '@/components/Skeleton';
import { PetImageGallery } from '@/components/pet/PetImageGallery';
import { PetInfoCard } from '@/components/pet/PetInfoCard';
import { RescuerSidebar } from '@/components/pet/RescuerSidebar';

export default function PetProfile() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [userApplication, setUserApplication] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPetAndApp() {
      if (!id) return;

      const localPet = findLocalPetById(id);
      if (localPet) setPet(localPet);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      const petData = await fetchPetById(supabase, id);

      if (petData) setPet(petData);

      const localApplication = getLocalApplications().find((app) => app.pet_id === id);
      if (localApplication) setUserApplication(localApplication);

      if (user) {
        const { data: appData } = await supabase
          .from('applications')
          .select('status')
          .eq('pet_id', id)
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (appData?.[0]) setUserApplication(appData[0]);
      }

      setLoading(false);
    }

    fetchPetAndApp();
  }, [id]);

  if (loading) {
    return (
      <div className="profile-layout">
        <div>
          <Skeleton height={420} className="main-img" />
          <div className="section-card" style={{ marginTop: '20px' }}>
            <Skeleton height={24} width="40%" style={{ marginBottom: '16px' }} />
            <SkeletonText lines={3} width={['90%', '95%', '60%']} />
          </div>
        </div>
        <div className="right-sidebar">
          <div className="right-card">
            <Skeleton height={20} width="70%" style={{ marginBottom: '16px' }} />
            <Skeleton circle width={48} height={48} style={{ marginBottom: '16px' }} />
            <Skeleton height={48} style={{ marginBottom: '10px' }} />
          </div>
        </div>
      </div>
    );
  }
  if (!pet) return <div style={{ padding: '60px', textAlign: 'center' }}>Pet not found.</div>;
  if (pet.is_hidden && currentUserId !== pet.rescuer_id) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>This listing isn't available right now.</div>;
  }

  const rescuerName = pet.profiles?.first_name
    ? `${pet.profiles.first_name} ${pet.profiles.last_name || ''}`
    : pet.rescuer_name || 'Verified Rescuer';

  return (
    <>
      <div className="top-bar">
        <Link href="/browse" className="back-link">← Back to Browse</Link>
      </div>

      <div className="profile-layout">
        <div>
          <PetImageGallery petName={pet.name} petAge={pet.age} fallbackImage={pet.image_url} gallery={pet.gallery} isFeatured={isPetCurrentlyFeatured(pet)} />
          <PetInfoCard pet={pet} />
        </div>

        <div className="right-sidebar">
          <RescuerSidebar pet={pet} rescuerName={rescuerName} currentUserId={currentUserId} userApplication={userApplication} />
        </div>
      </div>
    </>
  );
}
