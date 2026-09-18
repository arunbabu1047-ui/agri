export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const documentTypes = ['application/pdf'];
export const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

export function isValidUrl(value) {
  if (!value) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

export function youtubeId(url = '') {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1);
    if (parsed.hostname.includes('youtube.com')) return parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
  } catch { return null; }
  return null;
}
