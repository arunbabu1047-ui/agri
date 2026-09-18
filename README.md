# Agri Pulse

A responsive Tamil + English agriculture information site built with React, Vite, MUI, React Router, react-i18next, and Supabase.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

The app uses sample content when Supabase variables are not configured. This is clearly labeled as preview data; authentication, uploads, and persistence become active once the Supabase project is connected.

## Supabase setup

1. Create a Supabase project and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env` (older projects can use `VITE_SUPABASE_ANON_KEY`).
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor.
3. Create public storage buckets named `content-images`, `content-videos`, and `content-documents`; apply the policies in `supabase/migrations/002_storage_policies.sql`.
4. Deploy `supabase/functions/invite-contributor/index.ts` with `supabase functions deploy invite-contributor` and set `SUPABASE_SERVICE_ROLE_KEY` as a server-side secret.
5. Create the first user in Supabase Auth, then promote that account with the `promote_first_admin` SQL function. Never put the service-role key in the frontend.
6. Set the Supabase Auth site URL and redirect URLs to your local or deployed origin, including `/admin/reset-password`.

## Manual checklist

- Switch Tamil / English and refresh; selected language and bilingual content should persist.
- Anonymous users can browse published sample content but cannot access admin routes.
- With Supabase configured, sign in at `/admin/login`; contributor permissions are checked by RLS and the role guard.
- Test draft, pending review, rejected, and published states from the admin content forms.
- Verify upload size/type errors, unsaved-change warnings, delete confirmations, and mobile navigation.
