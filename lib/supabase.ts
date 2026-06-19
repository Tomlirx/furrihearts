import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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

function createMockSupabase() {
  return {
    __isMock: true,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: { message: 'Supabase is not configured. Use demo mode or add env variables.' } }),
      signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase is not configured. Use demo mode or add env variables.' } }),
      signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase is not configured. Use demo mode or add env variables.' } }),
      signOut: async () => ({ error: null }),
    },
    from: () => createMockQuery(),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Supabase storage is not configured.' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

export const supabase: any = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : createMockSupabase();
