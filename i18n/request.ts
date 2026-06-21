import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME, DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/lib/locale-constants';

// Same-URL locale strategy: no [locale] route segment, no routing
// middleware. Every request — root layout included — resolves its locale
// the exact same way, from a single cookie. This avoids the dual-resolution
// bug class the previous URL-prefixed design hit (root layout vs. the
// [locale] segment disagreeing on locale), since there is no segment split
// left to reconcile.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale: Locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
