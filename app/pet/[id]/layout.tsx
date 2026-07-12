import type { Metadata } from 'next';
import { IntlScope } from '@/components/IntlScope';
import { createClient } from '@/utils/supabase/server';
import { SITE_URL } from '@/lib/site';

// Per-pet Open Graph / Twitter metadata so a shared listing link unfurls with
// the pet's photo, name and details on FB/X/WhatsApp/etc. Runs server-side
// (crawlers read this <head>), even though the page body below is a Client
// Component that re-fetches the pet for interactivity.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: pet } = await supabase
      .from('pets')
      .select('name, breed, age, gender, location, description, image_url, is_hidden, review_status')
      .eq('id', id)
      .single();

    // Not found or not publicly viewable → generic, non-indexed (don't leak).
    if (!pet || pet.is_hidden || (pet.review_status && pet.review_status !== 'approved')) {
      return { robots: { index: false, follow: false } };
    }

    const bits = [pet.gender, pet.age, pet.breed].filter(Boolean).join(' · ');
    const title = `Adopt ${pet.name}`;
    const description = (pet.description?.trim()
      || `${pet.name} — ${bits}${pet.location ? ` in ${pet.location}` : ''} — is looking for a loving home.`).slice(0, 200);
    const url = `${SITE_URL}/pet/${id}`;

    // og:image / twitter:image come from the co-located opengraph-image.tsx
    // (a composited 1200x630 card with the pet photo) — do NOT set images here
    // or it would override that correctly-sized card with the raw upload.
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { type: 'article', title: `${title} · FurriHearts`, description, url },
      twitter: { card: 'summary_large_image', title: `${title} · FurriHearts`, description },
    };
  } catch {
    return {};
  }
}

// app/pet/[id]/page.tsx is a Client Component (data fetched in a useEffect),
// so it needs a NextIntlClientProvider scoped to the PetDetail namespace.
export default function PetDetailLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['PetDetail']}>{children}</IntlScope>;
}
