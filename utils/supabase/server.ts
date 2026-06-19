import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function createMockQuery() {
  const response = Promise.resolve({
    data: null,
    error: { message: 'Supabase is not configured. Using local demo mode.' },
  });

  const query: any = {
    select: () => query,
    insert: () => response,
    update: () => query,
    delete: () => query,
    eq: () => query,
    in: () => query,
    ilike: () => query,
    order: () => query,
    single: () => response,
    maybeSingle: () => response,
    then: response.then.bind(response),
    catch: response.catch.bind(response),
    finally: response.finally.bind(response),
  };

  return query;
}

function createMockServerClient() {
  return {
    __isMock: true,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: { message: 'Supabase is not configured. Use demo mode or add env variables.' } }),
      signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase is not configured. Use demo mode or add env variables.' } }),
    },
    from: () => createMockQuery(),
  };
}

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return createMockServerClient() as any;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies; middleware or route handlers can.
        }
      },
    },
  });
}
