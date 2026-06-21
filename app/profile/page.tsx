import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getMyPets, getMyApplications } from '@/lib/profile-data';
import { getServerLocale, localeHref } from '@/lib/locale';
import DashboardTabs from '@/components/DashboardTabs';
import './styles.css';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getServerLocale();
    redirect(`${localeHref('/login', locale)}?next=/profile`);
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
  const [myPets, myApplications] = await Promise.all([
    getMyPets(supabase, user!.id),
    getMyApplications(supabase, user!.id),
  ]);

  const isRescuer = myPets.length > 0;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="profile-page">
      <DashboardTabs />
      <div className="profile-header">
        <div className="profile-avatar-lg">{(profile?.first_name || user!.email || '?')[0]?.toUpperCase()}</div>
        <div className="profile-header-info">
          <h1>{profile?.first_name} {profile?.last_name}</h1>
          <p className="profile-meta">{profile?.location || 'Malaysia'} · Member since {memberSince}</p>
          <div className="profile-badges">
            <span className={user!.email_confirmed_at ? 'badge-verified' : 'badge-pending'}>
              {user!.email_confirmed_at ? '✅ Email Verified' : '⏳ Email Pending'}
            </span>
            <span className={profile?.is_id_verified ? 'badge-verified' : 'badge-pending'}>
              {profile?.is_id_verified ? '✅ ID Verified' : '⏳ ID Pending'}
            </span>
          </div>
        </div>
        <div className="profile-header-actions">
          <Link href="/profile/edit" className="btn-edit-profile">Edit Profile</Link>
          <Link href={`/profile/${user!.id}`} className="btn-public-view">Public View</Link>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card"><div className="stat-num">{myApplications.length}</div><div className="stat-label">Applications</div></div>
        {isRescuer && <div className="stat-card"><div className="stat-num">{myPets.length}</div><div className="stat-label">Active Listings</div></div>}
      </div>

      {isRescuer && (
        <div className="profile-section">
          <h2>About Me</h2>
          <p className="profile-bio">{profile?.bio || 'No bio added yet — tell adopters a bit about your rescue work in Edit Profile.'}</p>
          {profile?.specialities?.length > 0 && (
            <div className="speciality-tags">
              {profile.specialities.map((s: string) => <span key={s} className="speciality-tag">{s}</span>)}
            </div>
          )}
        </div>
      )}

      <div className="profile-section">
        <h2>My Details</h2>
        <div className="detail-row"><span>Full Name</span><span>{profile?.first_name} {profile?.last_name}</span></div>
        <div className="detail-row"><span>Email</span><span>{profile?.email || user!.email}</span></div>
        <div className="detail-row"><span>Phone</span><span>{profile?.phone || 'Not added'}</span></div>
        <div className="detail-row"><span>Location</span><span>{profile?.location || 'Not added'}</span></div>
      </div>

      <div className="profile-section">
        <h2>Account Settings</h2>
        <Link href="/profile/edit" className="settings-row">Edit Profile & Privacy →</Link>
        <Link href="/my-applications" className="settings-row">My Applications →</Link>
        <Link href="/all-listings" className="settings-row">My Listings →</Link>
      </div>
    </div>
  );
}
