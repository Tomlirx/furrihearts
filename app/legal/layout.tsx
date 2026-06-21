import { IntlScope } from '@/components/IntlScope';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['Legal']}>{children}</IntlScope>;
}
