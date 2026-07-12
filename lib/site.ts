// Canonical public site URL, used for absolute Open Graph image URLs and
// share links. Set NEXT_PUBLIC_SITE_URL in the environment (Vercel too);
// the fallback keeps OG absolute URLs valid if it's ever missing.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://furrihearts.antsclass.com').replace(/\/$/, '');
