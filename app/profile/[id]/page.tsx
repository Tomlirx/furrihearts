import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMyPets, getFollowedRescuerIds } from '@/lib/profile-data';
import FollowButton from './FollowButton';
import EmptyState from '@/components/EmptyState';
import PublicListingsGrid from '@/components/profile/PublicListingsGrid';
import '../styles.css';
import './styles.css';

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (!profile) notFound();

  const allPets = await getMyPets(supabase, id);
  const activePets = allPets.filter((p: any) => p.status === 'available' && !p.is_hidden && p.review_status === 'approved');
  const isRescuer = allPets.length > 0;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' }) : '—';

  const isFollowing = user ? (await getFollowedRescuerIds(supabase, user.id)).includes(id) : false;
  const isSelf = user?.id === id;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-lg">{(profile?.first_name || '?')[0]?.toUpperCase()}</div>
        <div className="profile-header-info">
          <h1>{profile?.first_name} {profile?.last_name}</h1>
          <p className="profile-meta">{profile?.location || 'Malaysia'} · Member since {memberSince}</p>
          <div className="profile-badges">
            <span className="badge-verified">✅ Email Verified</span>
          </div>
        </div>
        {!isSelf && user && <FollowButton rescuerId={id} initialFollowing={isFollowing} />}
        {isSelf && <Link href="/profile/edit" className="btn-edit-profile">Edit Profile</Link>}
      </div>

      {isRescuer && (
        <>
          <div className="cta-banner">
            <div>
              <strong>Interested in adopting?</strong> Get in touch with {profile?.first_name}.
            </div>
            <Link href="/browse" className="btn-edit-profile">Browse Listings</Link>
          </div>

          <div className="profile-section">
            <h2>About {profile?.first_name}</h2>
            <p className="profile-bio">{profile?.bio || 'This rescuer hasn\'t added a bio yet.'}</p>
          </div>

          {(profile?.show_email || profile?.show_phone || profile?.show_whatsapp) && (
            <div className="profile-section">
              <h2>Contact</h2>
              {profile?.show_email && <div className="detail-row"><span>Email</span><span>{profile.email}</span></div>}
              {profile?.show_phone && <div className="detail-row"><span>Phone</span><span>{profile.phone}</span></div>}
              {profile?.show_whatsapp && <div className="detail-row"><span>WhatsApp</span><span>{profile.phone}</span></div>}
            </div>
          )}

          <div className="profile-section">
            <h2>Active Listings</h2>
            {activePets.length > 0 ? (
              <PublicListingsGrid pets={activePets} />
            ) : (
              <EmptyState
                icon="🐾"
                title="No active listings right now"
                description={`${profile?.first_name || 'This rescuer'} doesn't have any pets available for adoption at the moment.`}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
