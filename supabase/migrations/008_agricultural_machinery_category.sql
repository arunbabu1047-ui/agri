-- Give the existing machinery topic a clearer label without changing its ID.
update public.categories
set name_en = 'Agricultural Machinery',
    name_ta = U&'\0bb5\0bbf\0bb5\0b9a\0bbe\0baf \0b87\0baf\0ba8\0bcd\0ba4\0bbf\0bb0\0b99\0bcd\0b95\0bb3\0bcd'
where id = 'machinery';
