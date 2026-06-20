import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/admin';
import { getUserDetail } from '@/lib/admin-data';
import AuditorToggleButton from './AuditorToggleButton';
import '../../../dashboard/styles.css';

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const { profile, pets, applications } = await getUserDetail(admin, id);
  if (!profile) notFound();

  return (
    <div>
      <Link href="/admin/users" style={{ color: 'var(--orange)', fontSize: '13px' }}>← All Users</Link>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', margin: '12px 0 20px' }}>{profile.first_name} {profile.last_name}</h1>

      <div className="section-card">
        <h3 style={{ marginBottom: '12px' }}>Profile</h3>
        <div className="detail-row"><span>Email</span><span>{profile.email}</span></div>
        <div className="detail-row"><span>Phone</span><span>{profile.phone || '—'}</span></div>
        <div className="detail-row"><span>Location</span><span>{profile.location || '—'}</span></div>
        <div className="detail-row"><span>Admin</span><span>{profile.is_admin ? 'Yes' : 'No'}</span></div>
        <div className="detail-row"><span>Auditor</span><span><AuditorToggleButton userId={profile.id} isAuditor={!!profile.is_auditor} /></span></div>
        <div className="detail-row"><span>Joined</span><span>{profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : '—'}</span></div>
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: '12px' }}>Pets Listed ({pets.length})</h3>
        {pets.length === 0 ? <p style={{ color: 'var(--light)', fontSize: '13px' }}>No pets listed.</p> : pets.map((pet: any) => (
          <div className="listing-row" key={pet.id}>
            <img src={pet.image_url} className="row-thumb" alt={pet.name} />
            <div className="row-info"><h4>{pet.name}</h4><p>{pet.status} · {pet.location}</p></div>
            <Link href={`/pet/${pet.id}`} className="admin-btn">View</Link>
          </div>
        ))}
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: '12px' }}>Applications Submitted ({applications.length})</h3>
        {applications.length === 0 ? <p style={{ color: 'var(--light)', fontSize: '13px' }}>No applications submitted.</p> : applications.map((app: any) => (
          <div className="app-row" key={app.id}>
            <img src={app.pets?.image_url} className="row-thumb" style={{ borderRadius: '50%' }} alt={app.pets?.name} />
            <div className="row-info"><h4>{app.pets?.name}</h4></div>
            <span className={`status-badge ${app.status}`}>{app.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
