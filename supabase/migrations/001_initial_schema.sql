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

create or replace function public.promote_first_admin(target_user_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.profiles where role = 'admin' and is_active = true) then raise exception 'An administrator already exists'; end if;
  update public.profiles set role = 'admin', is_active = true where id = target_user_id;
end; $$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.news enable row level security;
alter table public.videos enable row level security;
alter table public.resources enable row level security;

create policy "profiles own or admin read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
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
