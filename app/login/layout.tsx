import { IntlScope } from '@/components/IntlScope';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['Login']}>{children}</IntlScope>;
}
