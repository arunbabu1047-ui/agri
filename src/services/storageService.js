import { isSupabaseConfigured, supabase } from '../lib/supabase';

const bucketNames = { images: 'content-images', videos: 'content-videos', documents: 'content-documents' };

export async function uploadFile(bucket, file, _path, onProgress) {
  if (!file) return null;
  if (!isSupabaseConfigured) {
    onProgress?.(100);
    return URL.createObjectURL(file);
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Sign in before uploading files.');
  const storageBucket = bucketNames[bucket] || bucket;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  onProgress?.(15);
  const { error } = await supabase.storage.from(storageBucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  onProgress?.(100);
  return path;
}
