// app/actions/auth.ts
'use server'

import { createClient } from '@/utils/supabase/server'; // Ensure you have this helper

export async function signUpUser(formData: any) {
  const supabase = await createClient();

  // 1. Sign up user
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { first_name: formData.first, last_name: formData.last }
    }
  });

  if (error) return { error: error.message };

  // 2. Create the profile row
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: formData.email,
      first_name: formData.first,
      last_name: formData.last,
      name: `${formData.first} ${formData.last}`.trim(),
    });
    if (profileError) console.error("Profile creation error:", profileError);
  }

  return { success: true };
}
// Add this function below your existing signUpUser function in app/actions/auth.ts

export async function signInUser(formData: any) {
  const supabase = await createClient();

  // Sign in using Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Success
  return { success: true };
}

export async function signOutUser() {
  // Auth cookies are httpOnly, so the browser client's signOut() can clear
  // its own localStorage/in-memory state but can never actually clear the
  // server-readable session cookie — only a server response can do that.
  // Without this, the server (layout.tsx, proxy.ts) keeps seeing the old
  // session after "logging out" client-side.
  const supabase = await createClient();
  await supabase.auth.signOut();
}
