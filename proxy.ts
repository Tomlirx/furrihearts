// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// This function name 'proxy' is required by the Next.js 16 convention
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. PERFORMANCE GUARD: Skip processing for static assets
  if (
    path.startsWith('/_next') || 
    path.startsWith('/auth') ||
    path === '/login' ||
    path === '/signup' ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // Create an empty response object to hold our session cookies
  let response = NextResponse.next({ request });

  // 2. SUPABASE SSR CLIENT: Manage session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Apply cookies to the response
            response.cookies.set(name, value, {
              ...options,
              path: '/', // CRITICAL: Cookies must have path '/' to persist across the app
              secure: process.env.NODE_ENV === 'production', // Disable secure for localhost dev
              sameSite: 'lax',
            });
          });
        },
      },
    }
  );

  // 3. SESSION VALIDATION
  // This triggers a token refresh if needed and sets the cookies via the 'setAll' hook above
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. ROUTE PROTECTION
  // If user is not logged in and tries to access restricted areas
  if (path.startsWith('/rescuer-listing') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Always return the response with the potentially updated cookies
  return response;
}