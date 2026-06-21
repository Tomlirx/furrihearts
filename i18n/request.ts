import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { cookies, headers } from 'next/headers';
import { routing } from './routing';
import { LOCALE_COOKIE_NAME } from '@/lib/locale';

// Resolves the locale primarily from the `x-app-locale` header proxy.ts
// stamps on every request — computed deterministically from the URL, so the
// root layout (app/layout.tsx, which sits above the [locale] segment and has
// no params.locale of its own) reads the exact same value as nested
// [locale] pages. Without this, root layout fell back to the NEXT_LOCALE
// cookie alone, which is wrong/missing on a first-ever visit to a
// non-default-locale URL — causing Navbar/Footer to show English while the
// page body (resolved straight from the URL) correctly showed Chinese.
export default getRequestConfig(async ({ requestLocale }) => {
  const headerStore = await headers();
  const headerLocale = headerStore.get('x-app-locale');
  let locale = hasLocale(routing.locales, headerLocale) ? headerLocale : undefined;

  if (!locale) {
    const requested = await requestLocale;
    locale = hasLocale(routing.locales, requested) ? requested : undefined;
  }

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
