import { IntlScope } from '@/components/IntlScope';

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['ForgotPassword']}>{children}</IntlScope>;
}
