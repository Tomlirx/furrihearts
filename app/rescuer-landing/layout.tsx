import { IntlScope } from '@/components/IntlScope';

export default function RescuerLandingLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['RescuerLanding']}>{children}</IntlScope>;
}
