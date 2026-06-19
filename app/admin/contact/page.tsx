import { createAdminClient } from '@/utils/supabase/admin';
import { getContactMessages } from '@/lib/admin-data';
import '../../dashboard/styles.css';
import AdminContactList from './AdminContactList';

export default async function AdminContactPage() {
  const admin = createAdminClient();
  const messages = await getContactMessages(admin);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', marginBottom: '16px' }}>Contact Messages ({messages.length})</h1>
      <AdminContactList messages={messages} />
    </div>
  );
}
