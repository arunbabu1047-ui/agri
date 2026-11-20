import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return json({ error: 'Sign in as an administrator to translate stories.' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleTranslateKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
    if (!googleTranslateKey) return json({ error: 'Translation is not configured. Add GOOGLE_TRANSLATE_API_KEY to Supabase Edge Function secrets.' }, 500);

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser();
    if (authError || !caller) return json({ error: 'Your session has expired. Sign in again.' }, 401);

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileError } = await adminClient.from('profiles').select('role,is_active').eq('id', caller.id).single();
    if (profileError || profile?.role !== 'admin' || !profile?.is_active) return json({ error: 'Administrator permission is required.' }, 403);

    const requestBody = await request.json();
    const ids = Array.isArray(requestBody.ids) ? [...new Set(requestBody.ids.filter((id: unknown) => typeof id === 'string'))] : [];
    if (!ids.length || ids.length > 5) return json({ error: 'Select between 1 and 5 stories per request.' }, 400);

    const { data: stories, error: storiesError } = await adminClient
      .from('news')
      .select('id,title_en,summary_en,body_en,title_ta,summary_ta,body_ta')
      .in('id', ids);
    if (storiesError) throw storiesError;

    const translated: string[] = [];
    const skipped: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const story of stories || []) {
      const fields = [
        { source: story.title_en, target: story.title_ta, column: 'title_ta' },
        { source: story.summary_en, target: story.summary_ta, column: 'summary_ta' },
        { source: story.body_en, target: story.body_ta, column: 'body_ta' },
      ].filter((field) => typeof field.source === 'string' && field.source.trim() && !field.target?.trim());

      if (!fields.length) { skipped.push(story.id); continue; }
      const totalCharacters = fields.reduce((total, field) => total + field.source.length, 0);
      if (totalCharacters > 28000) {
        failed.push({ id: story.id, error: 'This article is too long to translate in one request. Shorten the article or translate it in smaller sections.' });
        continue;
      }

      try {
        const translationUrl = new URL('https://translation.googleapis.com/language/translate/v2');
        translationUrl.searchParams.set('key', googleTranslateKey);
        const translationResponse = await fetch(translationUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: fields.map((field) => field.source), source: 'en', target: 'ta', format: 'text' }),
        });
        const translationResult = await translationResponse.json();
        if (!translationResponse.ok) {
          throw new Error(translationResult.error?.message || 'Translation provider rejected the request.');
        }

        const results = translationResult.data?.translations;
        if (!Array.isArray(results) || results.length !== fields.length || results.some((result: { translatedText?: string }) => !result.translatedText)) {
          throw new Error('Translation provider returned an incomplete translation.');
        }

        const update = Object.fromEntries(fields.map((field, index) => [field.column, results[index].translatedText]));
        const { error: updateError } = await adminClient.from('news').update(update).eq('id', story.id);
        if (updateError) throw updateError;
        translated.push(story.id);
      } catch (error) {
        failed.push({ id: story.id, error: error instanceof Error ? error.message : 'Translation failed.' });
      }
    }

    return json({ translated, skipped, failed });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to translate news.' }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
