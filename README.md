# A Slice of G Events

Website and booking flow for A Slice of G Events (asliceofg.com), a Toronto/GTA
interactive event experience rental business. React (Vite) single-page app,
Supabase (Postgres) backend, deployed on Vercel.

## Local development

```
npm install
npm run dev
```

## Building and prerendering

```
npm run build
```

This runs `vite build` then copies the prerendered static snapshots (in
`prerendered/`) into `dist/`, see `scripts/copy-prerendered.mjs`. Those
snapshots exist so search engines and link-preview bots, which don't run
JavaScript, see real page content instead of an empty shell.

Whenever page content changes, regenerate the snapshots and commit the
updated `prerendered/` folder:

```
npm run prerender
```

## Google Sheets ↔ Supabase sync

The decor catalog (`public.items`) and `public.experiences` can be managed
from a Google Sheet instead of the Supabase dashboard directly. A Google
Apps Script keeps the sheet and the database in sync in both directions.

**A reference copy of that script lives at
[`scripts/google-apps-script/supabase-sync.gs`](scripts/google-apps-script/supabase-sync.gs).**
The live, editable version runs inside Google's script editor (not in this
repo), so this copy won't affect anything on its own, but check it first
whenever:

- A sheet edit isn't showing up in Supabase, or a Supabase change isn't
  showing up after "Pull from Supabase."
- A new column was added to `public.items` or `public.experiences` in
  Supabase (e.g. the `variant_group`/`variant_label` columns from
  `supabase/item_variants_setup.sql`): **the column also needs to be typed
  into the matching sheet's header row**, spelled exactly like the Postgres
  column name. The script only syncs columns that already exist as headers
  on both sides; adding one in Supabase alone doesn't teach the sheet about
  it.
- Something about the sync's behaviour (which sheet maps to which table,
  which columns are treated as JSON/comma-separated lists, how new rows get
  their id written back) needs to be double-checked against what's actually
  deployed.

Keep the reference copy up to date: whenever the live script in
script.google.com is changed, copy the update back into this file (with the
service role key blanked out before committing).

## Repo layout

- `pages/`: top-level routed pages
- `components/`: shared UI components
- `*Content.js` (`packageContent.js`, `cateringContent.js`, `eventConfig.js`):
  copy, pricing, and pool data for the site and the Package Builder
- `api/`: Vercel serverless functions (Stripe checkout)
- `supabase/`: SQL setup scripts, run once each in the Supabase SQL editor
- `scripts/`: build-time and reference tooling (prerendering, the Google
  Apps Script reference copy above)
