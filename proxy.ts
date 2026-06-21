// proxy.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { localeHref } from './lib/locale';
import { IN_SCOPE_PREFIXES } from './lib/in-scope-routes';

const handleI18nRouting = createIntlMiddleware(routing);

const LOCALE_RE = /^\/(en|zh|ms)(?=\/|$)/;

function isInScopePath(pathname: string): boolean {
  if (pathname === '/' || LOCALE_RE.test(pathname)) return true;
  return IN_SCOPE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const LOCALE_HEADER = 'x-app-locale';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Resolve the locale for THIS exact request, deterministically from the
  // URL (when prefixed) or the NEXT_LOCALE cookie. The root layout
  // (app/layout.tsx) sits above the [locale] segment, so it cannot read
  // params.locale the way nested [locale] pages can — without this, root
  // layout falls back to the cookie alone, which is wrong/missing on a
  // first-ever visit to a non-default-locale URL (e.g. /zh with no cookie
  // set yet), causing Navbar/Footer to show English while the page body
  // (resolved from the URL directly) correctly shows Chinese.
  const localeMatch = path.match(LOCALE_RE);
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const resolvedLocale: string = localeMatch?.[1]
    || (cookieLocale && (routing.locales as readonly string[]).includes(cookieLocale) ? cookieLocale : routing.defaultLocale);

  // 0. LOCALE ROUTING: only for in-scope pages, so deferred pages keep their
  // existing unprefixed paths exactly as before.
  let response: NextResponse = isInScopePath(path)
    ? handleI18nRouting(request)
    : NextResponse.next({ request: { headers: request.headers } });

  // Stamp the resolved locale onto the request so every Server Component —
  // including the root layout — reads the same value next-intl's own
  // requestLocale resolves for the nested [locale] segment. Skip when the
  // response is a redirect (no content renders for this request anyway).
  if (!response.headers.get('location')) {
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, resolvedLocale);
    response = NextResponse.next({ request: { headers } });
    // Reconstructing the response above discards next-intl's own
    // NEXT_LOCALE cookie write — restore it so a bare in-scope visit (e.g.
    // /zh with no prior cookie) is still remembered for future bare visits.
    response.cookies.set('NEXT_LOCALE', resolvedLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // 1. SUPABASE SSR CLIENT: Manage session
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          );
        },
      },
    }
  );

  // 2. SESSION VALIDATION
  const { data: { user } } = await supabase.auth.getUser();

  // Strip a leading locale segment so route-protection checks below work the
  // same whether or not the current path carries an /en|/zh|/ms prefix.
  const bare = path.replace(LOCALE_RE, '') || '/';

  // 3. ROUTE PROTECTION (The Bouncer)
  // Define all routes that require a logged-in user
  const protectedRoutes = ['/dashboard', '/settings', '/applications', '/rescuer-listing', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => bare.startsWith(route));

  // If they are a stranger/guest trying to access a protected route, kick them to login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL(localeHref('/login', resolvedLocale), request.url));
  }

  // 4. AUTH REDIRECTION (The Usher)
  // Define routes that logged-in users should no longer see
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(route => bare.startsWith(route));

  // If they are already logged in and try to go to login/signup, push them to the app
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(localeHref('/browse', resolvedLocale), request.url));
  }

  // Always return the response to ensure cookies (and any locale redirect) are applied
  return response;
}

// 5. NATIVE PERFORMANCE GUARD
// This matcher tells Next.js to ignore images, SVGs, and internal build files
// so the proxy function only runs on actual page navigations and API routes.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
