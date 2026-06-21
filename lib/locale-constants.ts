// Shared, client-safe locale constants — kept separate from i18n/request.ts
// because that file imports next/headers (server-only); anything importing
// it would get pulled into the client bundle if a Client Component (like
// LanguageSwitcher) needed just these constants.
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const SUPPORTED_LOCALES = ['en', 'zh', 'ms'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
