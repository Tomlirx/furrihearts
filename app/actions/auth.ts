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

  // 2. Assign Roles in user_roles table
  if (data.user) {
    const roles = [];
    if (formData.purpose === 'adopter' || formData.purpose === 'both') roles.push('adopter');
    if (formData.purpose === 'rescuer' || formData.purpose === 'both') roles.push('rescuer');

    const roleEntries = roles.map(role => ({ user_id: data.user!.id, role_id: role }));
    
    const { error: roleError } = await supabase.from('user_roles').insert(roleEntries);
    if (roleError) console.error("Role assignment error:", roleError);
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