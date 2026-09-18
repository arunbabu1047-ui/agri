import { apiFormRequest, isApiConfigured } from '../lib/api';

export async function uploadFile(bucket, file, _path, onProgress) {
  if (!file) return null;
  if (!isApiConfigured) { onProgress?.(100); return URL.createObjectURL(file); }
  const form = new FormData(); form.append('bucket', bucket); form.append('file', file); onProgress?.(35);
  const result = await apiFormRequest('/uploads', form); onProgress?.(100); return result.url;
}
