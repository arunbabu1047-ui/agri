import { apiRequest, isApiConfigured } from '../lib/api';
import { news as sampleNews, videos as sampleVideos, resources as sampleResources, categories as sampleCategories } from '../data/contentData';

const samples = { news: sampleNews, videos: sampleVideos, resources: sampleResources, categories: sampleCategories };

function payloadForApi(type, payload) {
  const body = { ...payload };
  delete body.id;
  delete body.image;
  delete body.cover_image;
  delete body.file_name;
  delete body.media_url;

  if (type === 'news') {
    body.cover_image_url = payload.cover_image_url || payload.cover_image || payload.image || '';
  }
  if (type === 'videos') {
    body.thumbnail_url = payload.thumbnail_url || payload.image || '';
    body.source_credit = payload.source_credit || payload.source_name || '';
  }
  if (type === 'resources') {
    body.file_url = payload.file_url || payload.media_url || '';
    body.external_url = payload.external_url || payload.source_url || '';
    body.source_credit = payload.source_credit || payload.source_name || '';
  }
  return body;
}

export async function listContent(type, { includeUnpublished = false, language } = {}) {
  if (!isApiConfigured) return includeUnpublished ? samples[type] : samples[type].filter((item) => item.status === 'published');
  const params = new URLSearchParams();
  if (includeUnpublished) params.set('include_unpublished', 'true');
  if (language) params.set('language', language);
  const query = params.toString();
  return apiRequest('/content/' + type + (query ? '?' + query : ''));
}

export async function getContent(type, idOrSlug, language) {
  if (!isApiConfigured) return (samples[type] || []).find((item) => item.slug === idOrSlug || item.id === idOrSlug) || null;
  const query = language ? '?language=' + encodeURIComponent(language) : '';
  return apiRequest('/content/' + type + '/' + idOrSlug + query);
}

export async function saveContent(type, payload) {
  if (!isApiConfigured) return { ...payload, id: payload.id || `${type}-${Date.now()}`, updated_at: new Date().toISOString() };
  const body = payloadForApi(type, payload);
  return apiRequest(`/content/${type}${payload.id ? `/${payload.id}` : ''}`, { method: payload.id ? 'PATCH' : 'POST', body: JSON.stringify(body) });
}

export async function deleteContent(type, id) {
  if (!isApiConfigured) return true;
  await apiRequest(`/content/${type}/${id}`, { method: 'DELETE' });
  return true;
}

export async function listDashboardContent() {
  const [storyList, videoList, resourceList] = await Promise.all([listContent('news', { includeUnpublished: true }), listContent('videos', { includeUnpublished: true }), listContent('resources', { includeUnpublished: true })]);
  const all = [...storyList, ...videoList, ...resourceList];
  return { news: storyList, videos: videoList, resources: resourceList, all, pending: all.filter((item) => item.status === 'pending').length, published: all.filter((item) => item.status === 'published').length, drafts: all.filter((item) => item.status === 'draft').length };
}

export async function listCategories() { return isApiConfigured ? apiRequest('/categories') : sampleCategories; }

export async function createCategory(payload) {
  if (!isApiConfigured) return { id: payload.id, ...payload };
  return apiRequest('/categories', { method: 'POST', body: JSON.stringify(payload) });
}

export async function deleteCategory(id) {
  if (!isApiConfigured) return true;
  await apiRequest(`/categories/${id}`, { method: 'DELETE' });
  return true;
}
