import { IntlScope } from '@/components/IntlScope';

// app/pet/[id]/page.tsx is entirely a Client Component (data is fetched in
// a useEffect, not via Server Component params), so it — and everything it
// renders — needs a NextIntlClientProvider rather than getTranslations().
// This thin Server Component layout supplies one scoped to just the
// PetDetail namespace.
export default function PetDetailLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['PetDetail']}>{children}</IntlScope>;
}
