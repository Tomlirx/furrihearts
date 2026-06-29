'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE_NAME } from '@/lib/locale-constants';

const LOCALE_OPTIONS = [
  { code: 'en', display: 'EN', name: 'English' },
  { code: 'zh', display: 'CN', name: '中文' },
  { code: 'ms', display: 'BM', name: 'Bahasa Malaysia' },
];

export default function LanguageSwitcher({ className = 'lang-switcher' }: { className?: string }) {
  const currentLocale = useLocale();
  const router = useRouter();

  const switchTo = (code: string) => {
    if (code === currentLocale) return;
    document.cookie = `${LOCALE_COOKIE_NAME}=${code}; path=/; max-age=31536000`;
    // The URL never changes — just re-fetch the current page with the new
    // locale cookie applied.
    router.refresh();
  };

  return (
    <div className={className}>
      {LOCALE_OPTIONS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-opt lang-opt-text ${currentLocale === l.code ? 'active' : ''}`}
          onClick={() => switchTo(l.code)}
          aria-label={l.name}
          title={l.name}
        >
          {l.display}
        </button>
      ))}
    </div>
  );
}
