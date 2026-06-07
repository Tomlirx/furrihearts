import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
console.log('FULL URL:', request.url);
console.log('Search Params:', searchParams.toString());
console.log('Code:', searchParams.get('code'));
console.log('Error:', searchParams.get('error'));
console.log('Error Description:', searchParams.get('error_description'));
  const code = searchParams.get('code');

  console.log('====================================');
  console.log('OAuth Callback Started');
  console.log('Code exists:', !!code);
  console.log('Origin:', origin);

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
            console.log('Cookies Supabase wants to set:');

            cookiesToSet.forEach(({ name, value, options }) => {
              console.log({
                name,
                valueLength: value.length,
                options,
              });

              cookieStore.set(name, value, {
                ...options,
                path: '/',
              });
            });
          },
        },
      }
    );

    console.log('Exchanging OAuth code for session...');

    const { data, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ exchangeCodeForSession FAILED');
      console.error(error);
    } else {
      console.log('✅ exchangeCodeForSession SUCCESS');
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ getSession ERROR');
      console.error(sessionError);
    }

    console.log('Session exists:', !!session);

    if (session) {
      console.log('User ID:', session.user.id);
      console.log('Email:', session.user.email);
      console.log(
        'Provider:',
        session.user.app_metadata?.provider
      );
    }
  } else {
    console.log('❌ No OAuth code received');
  }

  console.log('Redirecting to homepage...');
  console.log('====================================');

  return NextResponse.redirect(new URL('/', origin));
}