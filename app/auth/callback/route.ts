// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { safeNext } from '@/lib/safe-redirect';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNext(requestUrl.searchParams.get('next'));
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

    // 2. Fetch the newly logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    let needsProfileCompletion = false;

    if (user) {
      // 3. Check for an existing profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', user.id)
        .single();

      // 4. First Time Login: Build the full profile from Google metadata
      if (!profile) {
        const meta = user.user_metadata || {};
        const firstName = meta.given_name || meta.full_name?.split(' ')[0] || '';
        const lastName = meta.family_name || meta.full_name?.split(' ').slice(1).join(' ') || '';

        await supabase.from('profiles').insert([{
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`.trim() || user.email,
        }]);

        needsProfileCompletion = !firstName || !lastName;
      } else {
        needsProfileCompletion = !profile.first_name || !profile.last_name;
      }
    }

    // 5. Send the user to the requested destination (e.g. password reset), or
    // to complete their profile if Google didn't return enough info to fill
    // in a name, or to the app by default.
    if (next) {
      return NextResponse.redirect(new URL(next, origin));
    }
    return NextResponse.redirect(new URL(needsProfileCompletion ? '/profile/edit' : '/browse', origin));
  }

  return NextResponse.redirect(new URL(next || '/browse', origin));
}