'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LOCALE_COOKIE_NAME } from '@/lib/locale';

const LOCALE_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ms', label: 'BM' },
];

const prefixPattern = new RegExp(`^/(${routing.locales.join('|')})(/.*)?$`);

export default function LanguageSwitcher({ className = 'lang-switcher' }: { className?: string }) {
  const currentLocale = useLocale();
  const rawPathname = usePathname();
  const router = useRouter();

  const switchTo = (code: string) => {
    document.cookie = `${LOCALE_COOKIE_NAME}=${code}; path=/; max-age=31536000`;

    // Only an in-scope (Phase 1) path will ever carry a /en|/zh|/ms prefix —
    // deferred pages (dashboard, admin, etc.) never do, so for those we just
    // refresh and let the root layout re-read the cookie for Navbar/Footer.
    const match = rawPathname.match(prefixPattern);
    if (match) {
      const rest = match[2] || '';
      router.push(`/${code}${rest}`);
    } else {
      router.refresh();
    }
  };

  return (
    <div className={className}>
      {LOCALE_OPTIONS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-opt ${currentLocale === l.code ? 'active' : ''}`}
          onClick={() => switchTo(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
