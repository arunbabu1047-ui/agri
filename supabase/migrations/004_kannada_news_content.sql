alter table public.news
  add column if not exists title_kn text not null default '',
  add column if not exists summary_kn text not null default '',
  add column if not exists body_kn text not null default '';
