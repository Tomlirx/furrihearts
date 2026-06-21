import { IntlScope } from '@/components/IntlScope';

// Both app/apply/[id]/page.tsx and its thank-you subpage are entirely
// Client Components (data fetched via useEffect), so they need a
// NextIntlClientProvider rather than getTranslations(). Scoped to just the
// two namespaces this subtree uses.
export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['Apply', 'ApplyThankYou']}>{children}</IntlScope>;
}
