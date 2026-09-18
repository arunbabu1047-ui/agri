import { apiRequest, isApiConfigured } from '../lib/api';
import { news as sampleNews, videos as sampleVideos, resources as sampleResources, categories as sampleCategories } from '../data/contentData';

const samples = { news: sampleNews, videos: sampleVideos, resources: sampleResources, categories: sampleCategories };

export async function listContent(type, { includeUnpublished = false } = {}) {
  if (!isApiConfigured) return includeUnpublished ? samples[type] : samples[type].filter((item) => item.status === 'published');
  return apiRequest(`/content/${type}${includeUnpublished ? '?include_unpublished=true' : ''}`);
}

export async function getContent(type, idOrSlug) {
  if (!isApiConfigured) return (samples[type] || []).find((item) => item.slug === idOrSlug || item.id === idOrSlug) || null;
  return apiRequest(`/content/${type}/${idOrSlug}`);
}

export async function saveContent(type, payload) {
  if (!isApiConfigured) return { ...payload, id: payload.id || `${type}-${Date.now()}`, updated_at: new Date().toISOString() };
  const { id, ...body } = payload;
  return apiRequest(`/content/${type}${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body: JSON.stringify(body) });
}

export async function deleteContent(type, id) { if (!isApiConfigured) return true; await apiRequest(`/content/${type}/${id}`, { method: 'DELETE' }); return true; }

export async function listDashboardContent() {
  const [storyList, videoList, resourceList] = await Promise.all([listContent('news', { includeUnpublished: true }), listContent('videos', { includeUnpublished: true }), listContent('resources', { includeUnpublished: true })]);
  const all = [...storyList, ...videoList, ...resourceList];
  return { news: storyList, videos: videoList, resources: resourceList, all, pending: all.filter((item) => item.status === 'pending').length, published: all.filter((item) => item.status === 'published').length, drafts: all.filter((item) => item.status === 'draft').length };
}

export async function listCategories() { return isApiConfigured ? apiRequest('/categories') : sampleCategories; }
