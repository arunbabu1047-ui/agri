import { supabase, isDemoMode } from '../lib/supabase';
import { MAX_FILE_SIZE } from '../utils/validators';

export async function uploadFile(bucket, file, path, onProgress) {
  if (!file) return null;
  if (file.size > MAX_FILE_SIZE) throw new Error('File is larger than the configured 50 MB limit.');
  if (isDemoMode || !supabase) {
    onProgress?.(100);
    return URL.createObjectURL(file);
  }
  onProgress?.(35);
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, cacheControl: '3600' });
  if (error) throw error;
  onProgress?.(100);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
