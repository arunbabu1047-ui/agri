# Bulk Tamil news translation

The News admin list has a **Translate missing Tamil** action. It translates missing Tamil title, summary, and article fields for all news items in batches. Existing Tamil text is preserved, and each story keeps its current draft/published status so translations can be reviewed before publishing.

## One-time setup

1. Enable the Google Cloud Translation API in a Google Cloud project and create an API key. Google Cloud may require billing to be enabled.
2. In the Supabase project dashboard, open **Edge Functions → Secrets** and add `GOOGLE_TRANSLATE_API_KEY` with that key. This is a server-side secret; do not put it in `VITE_*` variables or commit it to the repository.
3. Deploy the `translate-news-to-tamil` Edge Function to the same Supabase project. From a terminal with the Supabase CLI linked to the project, run:

   ```sh
   supabase functions deploy translate-news-to-tamil
   ```

4. Open **Admin → News** and choose **Translate missing Tamil**. Review the confirmation, then review translated stories before publishing them.

The function checks that the signed-in user is an active admin. It only fills empty Tamil fields and never publishes or overwrites a story. Google Cloud Translation is usage-billed; the confirmation lists how many stories are queued.
