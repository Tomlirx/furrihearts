import { IntlScope } from '@/components/IntlScope';

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['ResetPassword']}>{children}</IntlScope>;
}
