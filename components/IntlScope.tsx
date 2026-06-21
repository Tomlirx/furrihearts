import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { pickMessages } from '@/lib/intl';

// Wraps a Client Component subtree with a NextIntlClientProvider scoped to
// just the listed namespaces — used wherever a Client Component needs
// useTranslations() (e.g. HomeSearch, BrowseContent, ContactForm). Keeps
// each page's added client payload limited to its own small namespace
// instead of the full message bundle.
export async function IntlScope({
  namespaces,
  children,
}: {
  namespaces: string[];
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const scoped = pickMessages(messages, namespaces);

  return (
    <NextIntlClientProvider locale={locale} messages={scoped}>
      {children}
    </NextIntlClientProvider>
  );
}
