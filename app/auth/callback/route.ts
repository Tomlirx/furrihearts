// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              });
            });
          },
        }, 
      } 
    ); 
    
    // 1. Establish the secure session
    await supabase.auth.exchangeCodeForSession(code);

    // --- NEW: ONBOARDING INTERCEPT LOGIC ---
    
    // 2. Fetch the newly logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 3. Check for an existing profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // 4. First Time Login: Create empty profile & route to onboarding
      if (!profile) {
        await supabase.from('profiles').insert([
          { id: user.id, email: user.email }
        ]);
        return NextResponse.redirect(new URL('/onboarding', origin));
      }

      // 5. Incomplete Profile: Route to onboarding (if they skipped it before)
      if (!profile.role) {
        return NextResponse.redirect(new URL('/onboarding', origin));
      }
    }
  }

  // 6. Returning User (with a role): Send directly to the app
  return NextResponse.redirect(new URL('/browse', origin));
}