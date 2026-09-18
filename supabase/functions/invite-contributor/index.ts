import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) throw new Error('Missing authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error('Not authenticated');
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: callerProfile } = await adminClient.from('profiles').select('role,is_active').eq('id', caller.id).single();
    if (callerProfile?.role !== 'admin' || !callerProfile.is_active) throw new Error('Administrator permission required');
    const { email } = await request.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('A valid email is required');
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, { data: { role: 'contributor' } });
    if (error) throw error;
    if (data.user) await adminClient.from('profiles').upsert({ id: data.user.id, email, role: 'contributor', is_active: true });
    return new Response(JSON.stringify({ invited: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
