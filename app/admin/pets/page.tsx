import { createAdminClient } from '@/utils/supabase/admin';
import { getAllPets } from '@/lib/admin-data';
import '../../dashboard/styles.css';
import AdminPetsTable from './AdminPetsTable';

export default async function AdminPetsPage() {
  const admin = createAdminClient();
  const pets = await getAllPets(admin);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Pets ({pets.length})</h1>
      <AdminPetsTable pets={pets} />
    </div>
  );
}
