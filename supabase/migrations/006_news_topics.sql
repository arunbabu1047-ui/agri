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
