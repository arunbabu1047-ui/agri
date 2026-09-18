import { supabase, isDemoMode } from '../lib/supabase';

export async function inviteContributor(email) {
  if (isDemoMode || !supabase) return { preview: true, email };
  const { data, error } = await supabase.functions.invoke('invite-contributor', { body: { email } });
  if (error) throw error;
  return data;
}

export async function listContributors() {
  if (isDemoMode || !supabase) return [{ id: 'preview-contributor', name: 'Kavya Raman', email: 'kavya@example.org', role: 'contributor', status: 'Active', joined: '12 Jun 2025' }, { id: 'preview-editor', name: 'Arun Kumar', email: 'arun@example.org', role: 'contributor', status: 'Invited', joined: '08 Jun 2025' }];
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'contributor').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
