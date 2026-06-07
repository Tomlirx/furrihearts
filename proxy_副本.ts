// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. GUARD CLAUSE: Skip the proxy entirely for static files, API routes, 
  // or the auth callback to prevent infinite loops and memory crashes.
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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 2. GUARD CLAUSE: Only protect your specific rescuer routes
  if (path.startsWith('/rescuer-listing') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}