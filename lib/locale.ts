import { routing } from '@/i18n/routing';

// next-intl's standard cookie name for the user's chosen locale.
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

function normalizeLocale(value: string | undefined | null): string {
  if (value && (routing.locales as readonly string[]).includes(value)) return value;
  return routing.defaultLocale;
}

// Builds an href into one of the Phase 1 (in-scope) pages — used by deferred,
// non-[locale] pages and by shared chrome (Navbar/Footer) that link into
// Phase 1 routes, since they sit outside the [locale] segment and next-intl's
// own Link/redirect helpers only work inside it. Mirrors next-intl's
// `localePrefix: 'as-needed'` setting (i18n/routing.ts): the default locale
// gets no prefix, other locales do.
export function localeHref(path: string, locale: string): string {
  const resolved = normalizeLocale(locale);
  if (resolved === routing.defaultLocale) return path;
  return path === '/' ? `/${resolved}` : `/${resolved}${path}`;
}

// Server-side (Server Components, Server Actions, Route Handlers): reads the
// locale cookie via next/headers. Caller must await this.
export async function getServerLocale(): Promise<string> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

// Client-side (Client Components): reads the locale cookie synchronously
// from document.cookie.
export function getClientLocale(): string {
  if (typeof document === 'undefined') return routing.defaultLocale;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`));
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}
