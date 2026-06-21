import { IntlScope } from '@/components/IntlScope';

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['Signup']}>{children}</IntlScope>;
}
