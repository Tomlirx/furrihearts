import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { cookies } from 'next/headers';
import { routing } from './routing';
import { LOCALE_COOKIE_NAME } from '@/lib/locale';

// Resolves the locale from the [locale] route segment when present (Phase 1
// pages); otherwise falls back to the NEXT_LOCALE cookie so deferred pages
// outside app/[locale] (dashboard, admin, etc.) still get correct messages
// for shared chrome like Navbar/Footer.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  let locale = hasLocale(routing.locales, requested) ? requested : undefined;

  if (!locale) {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    locale = hasLocale(routing.locales, cookieLocale) ? cookieLocale : routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
