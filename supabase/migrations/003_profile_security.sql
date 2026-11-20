-- Apply the profile role change through the Supabase dashboard, not a client-callable function.
drop function if exists public.promote_first_admin(uuid);

-- Browser clients may update a user's display name, never their role or active state.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
