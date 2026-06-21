import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getServerLocale, localeHref } from '@/lib/locale';
import EditProfileForm from './EditProfileForm';
import '../styles.css';
import './styles.css';

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getServerLocale();
    redirect(`${localeHref('/login', locale)}?next=/profile/edit`);
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  return <EditProfileForm profile={profile} email={user!.email} />;
}
