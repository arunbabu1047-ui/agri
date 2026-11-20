import { isSupabaseConfigured, supabase } from '../lib/supabase';

export async function inviteContributor(email) {
  if (!isSupabaseConfigured) return { preview: true, email };
  const { data, error } = await supabase.functions.invoke('invite-contributor', { body: { email } });
  if (error) throw error;
  return data;
}

export async function listContributors() {
  if (!isSupabaseConfigured) return [{ id: 'preview-contributor', name: 'Kavya Raman', email: 'kavya@example.org', role: 'contributor', status: 'Active', joined: '12 Jun 2025' }];
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'contributor').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((user) => ({
    ...user,
    name: user.full_name || '',
    status: user.is_active ? 'Active' : 'Inactive',
    joined: user.created_at,
  }));
}
