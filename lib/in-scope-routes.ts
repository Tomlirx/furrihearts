// Phase-1 (in-scope) public/conversion pages — these live under app/[locale]/
// and need next-intl's locale-prefix routing. Everything else (dashboard,
// admin, auditor, etc.) is deferred and stays unprefixed. Shared between
// proxy.ts (route classification) and LanguageSwitcher.tsx (deciding whether
// switching locale should navigate to a new prefixed path).
export const IN_SCOPE_PREFIXES = [
  '/browse', '/pet', '/apply', '/login', '/signup', '/forgot-password',
  '/reset-password', '/rescuer-landing', '/about', '/contact', '/guide',
  '/legal', '/care-packages',
];
