import { supabase, isDemoMode } from '../lib/supabase';
import { news as sampleNews, videos as sampleVideos, resources as sampleResources, categories as sampleCategories } from '../data/contentData';

const tableMap = { news: 'news', videos: 'videos', resources: 'resources', categories: 'categories' };
const samples = { news: sampleNews, videos: sampleVideos, resources: sampleResources, categories: sampleCategories };

export async function listContent(type, { includeUnpublished = false } = {}) {
  if (isDemoMode || !supabase) return includeUnpublished ? samples[type] : samples[type].filter((item) => item.status === 'published');
  let query = supabase.from(tableMap[type]).select('*').order('created_at', { ascending: false });
  if (!includeUnpublished) query = query.eq('status', 'published');
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getContent(type, idOrSlug, key = 'slug') {
  const data = await listContent(type, { includeUnpublished: true });
  const found = data.find((item) => item[key] === idOrSlug || item.id === idOrSlug);
  if (found || isDemoMode || !supabase) return found || null;
  const { data: item, error } = await supabase.from(tableMap[type]).select('*').eq(key, idOrSlug).single();
  if (error) throw error;
  return item;
}

export async function saveContent(type, payload, user) {
  if (isDemoMode || !supabase) {
    return { ...payload, id: payload.id || `${type}-${Date.now()}`, updated_at: new Date().toISOString(), author_id: user?.id || 'preview-user' };
  }
  const clean = { ...payload, author_id: payload.author_id || user.id };
  const { data, error } = payload.id
    ? await supabase.from(tableMap[type]).update(clean).eq('id', payload.id).select().single()
    : await supabase.from(tableMap[type]).insert(clean).select().single();
  if (error) throw error;
  return data;
}

export async function deleteContent(type, id) {
  if (isDemoMode || !supabase) return true;
  const { error } = await supabase.from(tableMap[type]).delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function listDashboardContent() {
  const [storyList, videoList, resourceList] = await Promise.all([
    listContent('news', { includeUnpublished: true }), listContent('videos', { includeUnpublished: true }), listContent('resources', { includeUnpublished: true }),
  ]);
  const all = [...storyList, ...videoList, ...resourceList];
  return { news: storyList, videos: videoList, resources: resourceList, all, pending: all.filter((item) => item.status === 'pending').length, published: all.filter((item) => item.status === 'published').length, drafts: all.filter((item) => item.status === 'draft').length };
}

export async function listCategories() {
  if (isDemoMode || !supabase) return sampleCategories;
  const { data, error } = await supabase.from('categories').select('*').order('name_en');
  if (error) throw error;
  return data || [];
}
