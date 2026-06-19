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

    // 2. Fetch the newly logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 3. Check for an existing profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
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
      }
    }
  }

  // 5. Send the user straight to the app
  return NextResponse.redirect(new URL('/browse', origin));
}