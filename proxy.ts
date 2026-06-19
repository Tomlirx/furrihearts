// proxy.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
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
  const url = new URL(request.url);
  const path = url.pathname;

  // 3. ROUTE PROTECTION (The Bouncer)
  // Define all routes that require a logged-in user
  const protectedRoutes = ['/dashboard', '/settings', '/applications', '/rescuer-listing', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // If they are a stranger/guest trying to access a protected route, kick them to login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. AUTH REDIRECTION (The Usher)
  // Define routes that logged-in users should no longer see
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  // If they are already logged in and try to go to login/signup, push them to the app
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  // Always return the response to ensure cookies are set
  return supabaseResponse;
}

// 5. NATIVE PERFORMANCE GUARD
// This matcher tells Next.js to ignore images, SVGs, and internal build files
// so the proxy function only runs on actual page navigations and API routes.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
