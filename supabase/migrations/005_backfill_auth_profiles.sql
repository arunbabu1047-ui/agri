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
