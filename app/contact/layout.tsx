import { IntlScope } from '@/components/IntlScope';

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <IntlScope namespaces={['Contact', 'ContactForm']}>{children}</IntlScope>;
}
