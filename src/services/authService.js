import { isSupabaseConfigured, supabase } from '../lib/supabase';

function requireSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.local.');
}

export async function signIn(email, password) {
  requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email) {
  requireSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });
  if (error) throw error;
}

export async function confirmPasswordReset(_token, password) {
  requireSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function getProfile(userId) {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(full_name) {
  requireSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase.from('profiles').update({ full_name, updated_at: new Date().toISOString() }).eq('id', user.id).select().single();
  if (error) throw error;
  return data;
}
