// app/browse/page.tsx
import './styles.css'; // This connects your CSS file to this page
import { createClient } from '@/utils/supabase/server';
import BrowseContent from './BrowseContent';
import { redirect } from 'next/navigation';

export default async function BrowsePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="browse-page-wrapper">
       <BrowseContent />
    </div>
  );
}