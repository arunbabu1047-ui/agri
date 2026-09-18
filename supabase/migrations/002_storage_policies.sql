insert into storage.buckets (id, name, public) values
('content-images', 'content-images', false),
('content-videos', 'content-videos', false),
('content-documents', 'content-documents', false)
on conflict (id) do nothing;

create policy "published content files can be read" on storage.objects for select using (
  bucket_id in ('content-images', 'content-videos', 'content-documents') and (
    public.is_admin() or owner_id = auth.uid() or exists (
      select 1 from public.news where cover_image_url = name and status = 'published'
    ) or exists (
      select 1 from public.videos where (video_path = name or thumbnail_url = name) and status = 'published'
    ) or exists (
      select 1 from public.resources where file_path = name and status = 'published'
    )
  )
);

create policy "authenticated users upload content files" on storage.objects for insert to authenticated with check (
  bucket_id in ('content-images', 'content-videos', 'content-documents') and auth.uid() = owner_id
);

create policy "owners or admins update content files" on storage.objects for update to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "owners or admins delete content files" on storage.objects for delete to authenticated using (owner_id = auth.uid() or public.is_admin());
