-- Add an optional district or location to news stories.
alter table public.news
  add column if not exists district text not null default '';
