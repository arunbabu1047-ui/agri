import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { news as sampleNews, videos as sampleVideos, resources as sampleResources, categories as sampleCategories } from '../data/contentData';

const samples = { news: sampleNews, videos: sampleVideos, resources: sampleResources, categories: sampleCategories };
const storageBucket = { news: 'content-images', videos: 'content-images', resources: 'content-documents' };

function requireSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
}

async function mediaUrl(bucket, path) {
  if (!path || /^https?:\/\//i.test(path)) return path || '';
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365);
  if (error) return '';
  return data.signedUrl;
}

async function toItem(type, row) {
  const item = { ...row, date: row.published_at || row.created_at, author_name: row.profiles?.full_name || '' };
  if (type === 'news') item.image = await mediaUrl('content-images', row.cover_image_url);
  if (type === 'videos') {
    item.image = await mediaUrl('content-images', row.thumbnail_url);
    item.video_url = row.youtube_url || await mediaUrl('content-videos', row.video_path);
  }
  if (type === 'resources') item.file_url = await mediaUrl('content-documents', row.file_path);
  return item;
}

function fromPayload(type, payload, authorId) {
  const common = {
    slug: payload.slug,
    title_en: payload.title_en || '',
    title_ta: payload.title_ta || '',
    category_id: payload.category_id || null,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    status: payload.status || 'draft',
    review_note: payload.review_note || null,
    published_at: payload.published_at || null,
    updated_at: new Date().toISOString(),
  };
  if (type === 'news') return {
    ...common,
    title_kn: payload.title_kn || '',
    summary_en: payload.summary_en || '', summary_ta: payload.summary_ta || '',
    summary_kn: payload.summary_kn || '',
    body_en: payload.body_en || '', body_ta: payload.body_ta || '',
    body_kn: payload.body_kn || '',
    cover_image_url: payload.cover_image_url || payload.image || null,
    source_name: payload.source_name || '', source_url: payload.source_url || '',
    district: payload.district || '',
    ...(authorId ? { author_id: authorId } : {}),
  };
  if (type === 'videos') return {
    ...common,
    description_en: payload.description_en || '', description_ta: payload.description_ta || '',
    spoken_language: payload.spoken_language || 'Tamil',
    video_path: payload.video_url && !/^https?:\/\//i.test(payload.video_url) ? payload.video_url : null,
    youtube_url: payload.youtube_url || (payload.video_url?.includes('youtube') ? payload.video_url : null),
    thumbnail_url: payload.thumbnail_url || payload.image || null,
    source_credit: payload.source_name || '',
    ...(authorId ? { author_id: authorId } : {}),
  };
  return {
    ...common,
    description_en: payload.description_en || '', description_ta: payload.description_ta || '',
    type: payload.type || 'guide',
    file_path: payload.file_url && !/^https?:\/\//i.test(payload.file_url) ? payload.file_url : null,
    external_url: payload.external_url || '', source_credit: payload.source_name || '',
    ...(authorId ? { author_id: authorId } : {}),
  };
}

export async function listContent(type, { includeUnpublished = false } = {}) {
  if (!isSupabaseConfigured) return includeUnpublished ? samples[type] : samples[type].filter((item) => item.status === 'published');
  requireSupabase();
  let query = supabase.from(type).select('*, profiles(full_name)').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
  if (!includeUnpublished) query = query.eq('status', 'published');
  const { data, error } = await query;
  if (error) throw error;
  return Promise.all((data || []).map((row) => toItem(type, row)));
}

export async function getContent(type, idOrSlug) {
  if (!isSupabaseConfigured) return (samples[type] || []).find((item) => item.slug === idOrSlug || item.id === idOrSlug) || null;
  requireSupabase();
  let { data, error } = await supabase.from(type).select('*, profiles(full_name)').eq('slug', idOrSlug).maybeSingle();
  if (!data && !error) ({ data, error } = await supabase.from(type).select('*, profiles(full_name)').eq('id', idOrSlug).maybeSingle());
  if (error) throw error;
  return data ? toItem(type, data) : null;
}

export async function saveContent(type, payload, profile) {
  if (!isSupabaseConfigured) return { ...payload, id: payload.id || `${type}-${Date.now()}`, updated_at: new Date().toISOString() };
  requireSupabase();
  const row = fromPayload(type, payload, payload.id ? null : profile?.id);
  const query = payload.id
    ? supabase.from(type).update(row).eq('id', payload.id)
    : supabase.from(type).insert({ ...row, author_id: profile?.id });
  const { data, error } = await query.select('*, profiles(full_name)').single();
  if (error) throw error;
  return toItem(type, data);
}

export async function deleteContent(type, id) {
  if (!isSupabaseConfigured) return true;
  requireSupabase();
  const { error } = await supabase.from(type).delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function listDashboardContent() {
  const [newsList, videoList, resourceList] = await Promise.all([
    listContent('news', { includeUnpublished: true }),
    listContent('videos', { includeUnpublished: true }),
    listContent('resources', { includeUnpublished: true }),
  ]);
  const all = [...newsList, ...videoList, ...resourceList];
  return {
    news: newsList, videos: videoList, resources: resourceList, all,
    pending: all.filter((item) => item.status === 'pending').length,
    published: all.filter((item) => item.status === 'published').length,
    drafts: all.filter((item) => item.status === 'draft').length,
  };
}

export async function listCategories() {
  if (!isSupabaseConfigured) return samples.categories;
  const { data, error } = await supabase.from('categories').select('*').order('name_en');
  if (error) throw error;
  return (data || [])
    .map((category) => category.id === 'machinery' ? { ...category, name_en: 'Agricultural Machinery' } : category)
    .sort((left, right) => left.name_en.localeCompare(right.name_en));
}

export async function translateNewsToTamil(ids) {
  if (!isSupabaseConfigured) throw new Error('Connect Supabase before translating news.');
  const { data, error } = await supabase.functions.invoke('translate-news-to-tamil', { body: { ids } });
  if (error) {
    let details = null;
    try {
      if (error.context && typeof error.context.json === 'function') details = await error.context.json();
    } catch { /* Fall back to the Supabase function error message. */ }
    throw new Error(details?.error || error.message || 'Could not translate news.');
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function createCategory(payload) {
  if (!isSupabaseConfigured) return { id: payload.id, ...payload };
  const { data, error } = await supabase.from('categories').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  return true;
}
