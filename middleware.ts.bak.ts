// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Next.js requires the function to be named 'middleware' to execute correctly
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. PERFORMANCE GUARD: Skip proxying for static files, API routes, or Auth to prevent loops
  if (
    path.startsWith('/_next') || 
    path.startsWith('/auth') ||
    path === '/login' ||
    path === '/signup' ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  // 2. SUPABASE SSR CLIENT: Manage session cookies securely
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Apply cookies to the outgoing response so the browser saves them
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Active session check (Refreshes token if expired)
  const { data: { user } } = await supabase.auth.getUser();

  // 3. ROUTE PROTECTION: Only redirect if NOT logged in
  if (path.startsWith('/rescuer-listing') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}