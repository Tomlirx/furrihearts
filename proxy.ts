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

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 0. LOCALE ROUTING: only for in-scope pages, so deferred pages keep their
  // existing unprefixed paths exactly as before.
  let response: NextResponse = isInScopePath(path)
    ? handleI18nRouting(request)
    : NextResponse.next({ request: { headers: request.headers } });

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
  const localeMatch = path.match(LOCALE_RE);
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  const locale: string = localeMatch?.[1]
    || (localeCookie && (routing.locales as readonly string[]).includes(localeCookie) ? localeCookie : routing.defaultLocale);

  // 3. ROUTE PROTECTION (The Bouncer)
  // Define all routes that require a logged-in user
  const protectedRoutes = ['/dashboard', '/settings', '/applications', '/rescuer-listing', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => bare.startsWith(route));

  // If they are a stranger/guest trying to access a protected route, kick them to login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL(localeHref('/login', locale), request.url));
  }

  // 4. AUTH REDIRECTION (The Usher)
  // Define routes that logged-in users should no longer see
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(route => bare.startsWith(route));

  // If they are already logged in and try to go to login/signup, push them to the app
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(localeHref('/browse', locale), request.url));
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
