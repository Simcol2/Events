# Create Your Story

An interactive storybook activity for events (baby showers, etc.): guests scan a QR
code to answer prompts, a host moderates submissions live, a projector screen shows
the book assembling in real time, and after the event a full AI pipeline produces a
print-ready PDF keepsake.

This is a self-contained sub-app in the `simcol2/events` repo — its own Vite build,
its own Supabase schema (all tables prefixed `cys_`), deployed separately from the
marketing site but sharing the same Supabase project.

## Stack

- Vite + React + Tailwind (frontend)
- Supabase: Postgres, Auth, Storage, Realtime, Edge Functions (backend)
- `pdf-lib` inside an Edge Function for the final PDF (chosen over a headless-browser
  approach like Playwright because Supabase Edge Functions are Deno serverless
  functions with no OS-level browser binary available)
- AI (LLM + image generation) is stubbed behind a swappable interface — see
  `supabase/functions/_shared/ai/`. No external AI calls or API keys are required to
  run the whole pipeline end to end.

## One-time setup

1. Copy `.env.example` to `.env` and fill in the same `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` values already used by the root marketing site — this app
   shares that Supabase project.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if you don't have
   it, then link this project (run from this `create-your-story/` directory):
   ```
   supabase link --project-ref <your-project-ref>
   ```
3. Apply the migrations (creates all `cys_*` tables, RLS policies, the storage
   bucket, and the atomic moderation functions):
   ```
   supabase db push
   ```
4. Deploy the Edge Functions:
   ```
   supabase functions deploy generate-skeleton lock-skeleton submit-contribution \
     approve-contribution reject-contribution reset-live-page generate-final-book
   ```
5. Set the AI provider secrets (defaults to the stub if omitted — safe to skip this
   step entirely for local development/demos):
   ```
   supabase secrets set LLM_PROVIDER=stub IMAGE_PROVIDER=stub
   ```
   To swap in a real provider later, implement a new class against the
   `LlmProvider`/`ImageProvider` interfaces in `_shared/ai/llm.ts` / `image.ts`, wire
   it into the `getLlmProvider()`/`getImageProvider()` factories in `_shared/ai/index.ts`,
   and set `LLM_PROVIDER=openai` (or similar) plus the relevant API key as a secret —
   no other code needs to change.
6. Create at least one host user in Supabase Auth (Studio → Authentication → Add
   User) — there's no self-serve signup flow, since this is meant for the business
   owner/staff, not the public.

## Running locally

```
npm install
npm run dev
```

## Manual verification (no automated test suite exists for this app)

- **RLS**: use Supabase Studio's SQL editor to spot-check policies — e.g. `set role
  anon;` then try to select from `cys_guest_contributions` (should return nothing)
  or from `cys_events` where `status = 'draft'` (should also return nothing).
- **Realtime propagation**: open the guest page (`/g/:eventCode`), the moderation
  panel (`/host/events/:id/moderation`), and the live screen (`/live/:eventCode`) in
  three separate tabs. A guest submission should appear in the moderation panel
  without a refresh; approving it should update the live screen within about a
  second, with a glow animation on the affected page.
- **Full lifecycle**: create an event → fill out setup → generate the story skeleton
  → lock it → submit a few guest answers (including one doodle) → approve them in
  the moderation panel → confirm the live screen fills in and fires confetti once
  every guest slot is answered → generate the final book → download the PDF from
  `/host/events/:id/final` or the public `/book/:eventCode` page.
- Run `npm run build` before considering any change done — it's the closest thing to
  a CI gate this app has.
