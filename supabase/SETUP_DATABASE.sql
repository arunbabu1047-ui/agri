-- AB Agri initial Supabase schema setup. Run once in Supabase SQL Editor.
-- Creates content tables, policies, profiles, and the newsroom topics.
-- Grants admin access to the project owner account configured for this app.

BEGIN;

-- ===== 001_initial_schema.sql =====
create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'contributor');
create type public.content_status as enum ('draft', 'pending', 'published', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role public.user_role not null default 'contributor',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id text primary key,
  name_en text not null,
  name_ta text not null,
  icon text,
  color text,
  created_at timestamptz not null default now()
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '', title_ta text not null default '',
  summary_en text not null default '', summary_ta text not null default '',
  body_en text not null default '', body_ta text not null default '',
  cover_image_url text, category_id text references public.categories(id), tags text[] not null default '{}',
  source_name text, source_url text, author_id uuid not null references public.profiles(id),
  status public.content_status not null default 'draft', review_note text,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '', title_ta text not null default '',
  description_en text not null default '', description_ta text not null default '',
  spoken_language text not null default 'Tamil', category_id text references public.categories(id), tags text[] not null default '{}',
  video_path text, youtube_url text, thumbnail_url text, source_credit text,
  author_id uuid not null references public.profiles(id), status public.content_status not null default 'draft', review_note text,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null default '', title_ta text not null default '',
  description_en text not null default '', description_ta text not null default '',
  type text not null check (type in ('guide', 'article', 'link')), category_id text references public.categories(id),
  file_path text, external_url text, source_credit text,
  author_id uuid not null references public.profiles(id), status public.content_status not null default 'draft', review_note text,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

insert into public.categories (id, name_en, name_ta, icon, color) values
('crop', 'Crop cultivation', 'பயிர் சாகுபடி', '🌾', '#e7f3df'),
('soil', 'Soil & water', 'மண் மற்றும் நீர்', '🪨', '#f7ead7'),
('organic', 'Organic farming', 'இயற்கை விவசாயம்', '🍃', '#e0f1e5'),
('livestock', 'Livestock', 'கால்நடை', '🐄', '#f7e5dc'),
('machinery', 'Farm machinery', 'விவசாய இயந்திரங்கள்', '🚜', '#e8eddf'),
('technology', 'Agri technology', 'விவசாயத் தொழில்நுட்பம்', '📡', '#e3eef1')
on conflict (id) do nothing;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_active = true);
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.news enable row level security;
alter table public.videos enable row level security;
alter table public.resources enable row level security;

create policy "profiles own or admin read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "news published public or owner read" on public.news for select using (status = 'published' or author_id = auth.uid() or public.is_admin());
create policy "news contributor insert" on public.news for insert with check (author_id = auth.uid() and (status <> 'published' or public.is_admin()));
create policy "news owner edit or admin" on public.news for update using (author_id = auth.uid() or public.is_admin()) with check (public.is_admin() or (author_id = auth.uid() and status <> 'published'));
create policy "news owner delete or admin" on public.news for delete using (public.is_admin() or (author_id = auth.uid() and status <> 'published'));

create policy "videos published public or owner read" on public.videos for select using (status = 'published' or author_id = auth.uid() or public.is_admin());
create policy "videos contributor insert" on public.videos for insert with check (author_id = auth.uid() and (status <> 'published' or public.is_admin()));
create policy "videos owner edit or admin" on public.videos for update using (author_id = auth.uid() or public.is_admin()) with check (public.is_admin() or (author_id = auth.uid() and status <> 'published'));
create policy "videos owner delete or admin" on public.videos for delete using (public.is_admin() or (author_id = auth.uid() and status <> 'published'));

create policy "resources published public or owner read" on public.resources for select using (status = 'published' or author_id = auth.uid() or public.is_admin());
create policy "resources contributor insert" on public.resources for insert with check (author_id = auth.uid() and (status <> 'published' or public.is_admin()));
create policy "resources owner edit or admin" on public.resources for update using (author_id = auth.uid() or public.is_admin()) with check (public.is_admin() or (author_id = auth.uid() and status <> 'published'));
create policy "resources owner delete or admin" on public.resources for delete using (public.is_admin() or (author_id = auth.uid() and status <> 'published'));


-- ===== 002_storage_policies.sql =====
insert into storage.buckets (id, name, public) values
('content-images', 'content-images', false),
('content-videos', 'content-videos', false),
('content-documents', 'content-documents', false)
on conflict (id) do nothing;

create policy "published content files can be read" on storage.objects for select using (
  bucket_id in ('content-images', 'content-videos', 'content-documents') and (
    public.is_admin() or owner_id = auth.uid()::text or exists (
      select 1 from public.news where cover_image_url = name and status = 'published'
    ) or exists (
      select 1 from public.videos where (video_path = name or thumbnail_url = name) and status = 'published'
    ) or exists (
      select 1 from public.resources where file_path = name and status = 'published'
    )
  )
);

create policy "authenticated users upload content files" on storage.objects for insert to authenticated with check (
  bucket_id in ('content-images', 'content-videos', 'content-documents') and owner_id = auth.uid()::text
);

create policy "owners or admins update content files" on storage.objects for update to authenticated using (owner_id = auth.uid()::text or public.is_admin()) with check (owner_id = auth.uid()::text or public.is_admin());
create policy "owners or admins delete content files" on storage.objects for delete to authenticated using (owner_id = auth.uid()::text or public.is_admin());


-- ===== 003_profile_security.sql =====
-- Apply the profile role change through the Supabase dashboard, not a client-callable function.
drop function if exists public.promote_first_admin(uuid);

-- Browser clients may update a user's display name, never their role or active state.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;


-- ===== 004_kannada_news_content.sql =====
alter table public.news
  add column if not exists title_kn text not null default '',
  add column if not exists summary_kn text not null default '',
  add column if not exists body_kn text not null default '';


-- ===== 005_backfill_auth_profiles.sql =====
-- Create public profile rows for users who existed before the profile trigger was installed.
insert into public.profiles as existing (id, full_name, email)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  email
from auth.users
on conflict (id) do update
set email = excluded.email,
    full_name = case
      when existing.full_name is null or existing.full_name = '' then excluded.full_name
      else existing.full_name
    end;


-- ===== 006_news_topics.sql =====
insert into public.categories (id, name_en, name_ta, icon, color) values
  ('crop', 'Crop Cultivation', U&'\0baa\0baf\0bbf\0bb0\0bcd \0b9a\0bbe\0b95\0bc1\0baa\0b9f\0bbf', U&'\+01f33e', '#e7f3df'),
  ('farming-tips', 'Farming Tips', U&'\0bb5\0bbf\0bb5\0b9a\0bbe\0baf\0b95\0bcd \0b95\0bc1\0bb1\0bbf\0baa\0bcd\0baa\0bc1\0b95\0bb3\0bcd', U&'\+01f4a1', '#f4efd9'),
  ('government-schemes', 'Government Schemes', U&'\0b85\0bb0\0b9a\0bc1 \0ba4\0bbf\0b9f\0bcd\0b9f\0b99\0bcd\0b95\0bb3\0bcd', U&'\+01f3db', '#e9edf4'),
  ('market-prices', 'Market Prices', U&'\0b9a\0ba8\0bcd\0ba4\0bc8 \0bb5\0bbf\0bb2\0bc8\0b95\0bb3\0bcd', U&'\+01f4b9', '#f7ead7'),
  ('organic', 'Organic Farming', U&'\0b87\0baf\0bb1\0bcd\0b95\0bc8 \0bb5\0bbf\0bb5\0b9a\0bbe\0baf\0bae\0bcd', U&'\+01f33f', '#e0f1e5'),
  ('weather', 'Weather', U&'\0bb5\0bbe\0ba9\0bbf\0bb2\0bc8', U&'\+01f324', '#e3eef1'),
  ('technology', 'Technology', U&'\0ba4\0bca\0bb4\0bbf\0bb2\0bcd\0ba8\0bc1\0b9f\0bcd\0baa\0bae\0bcd', U&'\+01f4f1', '#e3eef1'),
  ('irrigation', 'Irrigation', U&'\0baa\0bbe\0b9a\0ba9\0bae\0bcd', U&'\+01f4a7', '#e3eef1'),
  ('crop-protection', 'Crop Protection', U&'\0baa\0baf\0bbf\0bb0\0bcd \0baa\0bbe\0ba4\0bc1\0b95\0bbe\0baa\0bcd\0baa\0bc1', U&'\+01f6e1', '#f7e5dc'),
  ('soil', 'Soil Management', U&'\0bae\0ba3\0bcd \0bae\0bc7\0bb2\0bbe\0ba3\0bcd\0bae\0bc8', U&'\+01f331', '#f7ead7'),
  ('seasonal-farming', 'Seasonal Farming', U&'\0baa\0bb0\0bc1\0bb5\0b95\0bbe\0bb2 \0bb5\0bbf\0bb5\0b9a\0bbe\0baf\0bae\0bcd', U&'\+01f342', '#e0f1e5'),
  ('machinery', 'Agricultural Machinery', U&'\0bb5\0bbf\0bb5\0b9a\0bbe\0baf \0b87\0baf\0ba8\0bcd\0ba4\0bbf\0bb0\0b99\0bcd\0b95\0bb3\0bcd', U&'\+01f69c', '#e8eddf'),
  ('agricultural-business', 'Agricultural Business', U&'\0bb5\0bbf\0bb5\0b9a\0bbe\0baf \0bb5\0ba3\0bbf\0b95\0bae\0bcd', U&'\+01f4bc', '#f4efd9'),
  ('water-management', 'Water Management', U&'\0ba8\0bc0\0bb0\0bcd \0bae\0bc7\0bb2\0bbe\0ba3\0bcd\0bae\0bc8', U&'\+01f30a', '#e3eef1')
on conflict (id) do update
set name_en = excluded.name_en,
    name_ta = excluded.name_ta,
    icon = excluded.icon,
    color = excluded.color;

-- Remove the old livestock topic only when no content still uses it.
delete from public.categories as category
where category.id = 'livestock'
  and not exists (select 1 from public.news where category_id = category.id)
  and not exists (select 1 from public.videos where category_id = category.id)
  and not exists (select 1 from public.resources where category_id = category.id);



-- ===== 007_news_location.sql =====
-- Add an optional district or location to news stories.
alter table public.news
  add column if not exists district text not null default '';



-- ===== 008_agricultural_machinery_category.sql =====
-- Give the existing machinery topic a clearer label without changing its ID.
update public.categories
set name_en = 'Agricultural Machinery',
    name_ta = U&'\0bb5\0bbf\0bb5\0b9a\0bbe\0baf \0b87\0baf\0ba8\0bcd\0ba4\0bbf\0bb0\0b99\0bcd\0b95\0bb3\0bcd'
where id = 'machinery';


-- Grant editor administration to the project owner account.
UPDATE public.profiles
SET role = 'admin', is_active = true
WHERE email = 'arunbabu1047@gmail.com';

COMMIT;
