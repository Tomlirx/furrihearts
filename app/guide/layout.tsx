import { IntlScope } from '@/components/IntlScope';

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['Guide']}>{children}</IntlScope>;
}
