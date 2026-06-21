'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { LOCALE_COOKIE_NAME, localeHref } from '@/lib/locale';
import { IN_SCOPE_PREFIXES } from '@/lib/in-scope-routes';

const LOCALE_OPTIONS = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ms', flag: '🇲🇾', name: 'Bahasa Malaysia' },
];

const LOCALE_RE = /^\/(en|zh|ms)(?=\/|$)/;

// Mirrors proxy.ts's isInScopePath — under localePrefix: 'as-needed' the
// default locale (en) carries no URL prefix, so in-scope-ness can no longer
// be detected just by checking for a /en|/zh|/ms prefix.
function isInScopePath(pathname: string): boolean {
  const bare = pathname.replace(LOCALE_RE, '') || '/';
  if (bare === '/') return true;
  return IN_SCOPE_PREFIXES.some((p) => bare === p || bare.startsWith(`${p}/`));
}

export default function LanguageSwitcher({ className = 'lang-switcher' }: { className?: string }) {
  const currentLocale = useLocale();
  const rawPathname = usePathname();
  const router = useRouter();

  const switchTo = (code: string) => {
    document.cookie = `${LOCALE_COOKIE_NAME}=${code}; path=/; max-age=31536000`;

    if (isInScopePath(rawPathname)) {
      const bare = rawPathname.replace(LOCALE_RE, '') || '/';
      router.push(localeHref(bare, code));
    }

    // Always refresh: the root layout's NextIntlClientProvider doesn't
    // automatically refetch on client-side navigation since it sits above
    // the [locale] segment (needed so deferred pages also get translated
    // chrome) — without this, Navbar/Footer and any Client Component reading
    // useTranslations() stay stuck on whichever locale first rendered.
    router.refresh();
  };

  return (
    <div className={className}>
      {LOCALE_OPTIONS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-opt ${currentLocale === l.code ? 'active' : ''}`}
          onClick={() => switchTo(l.code)}
          aria-label={l.name}
          title={l.name}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}
