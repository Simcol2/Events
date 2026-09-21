# Standing instructions for Claude Code

## Adding or reordering a catalog photo

**Never ask for the Supabase service role key, `ADMIN_PASSCODE`, or any
other credential in order to add or reorder a product photo.** That is
not how photos get added to the catalog when Claude is doing the work.

The `photos` column on `items` (and `gifts`) is a JSON array of strings.
Each entry is either an absolute Supabase Storage URL (what the `/admin`
page's own upload button writes, for a human using that page) or a path
like `/photos/some-file.jpg` - a file committed straight into
`public/photos/` in this repo and served statically at build time. Most
of the catalog (78 of 122 items, last checked) already uses the second
form. Index 0 in the array is the cover photo shown on every card and at
the top of the detail-page carousel.

To add one as Claude:

1. Save the image into `public/photos/<a-sensible-slug>.<ext>`.
2. Update that row with `mcp__Supabase__execute_sql`, e.g. to make a new
   photo the cover:
   ```sql
   update items
   set photos = '["/photos/<file>.jpg"]'::jsonb || photos
   where id = <item id>;
   ```
3. Update the same entry in the gitignored `scripts/_catalog-snapshot.json`
   mirror so local prerendering matches production.
4. Regenerate `prerendered/` for every page the item appears on (its own
   `/decor/:slug` or `/gifts/:slug` page, plus the `/decor` and `/gifts`
   listing pages if it's tagged into both) and commit everything -
   `public/photos/<file>`, the updated `prerendered/` snapshots - together.

No Supabase Storage upload, no admin passcode, and no service role key
are needed for any of that. See the README's "Admin page" section for the
full detail and for how the human-facing `/admin` upload path differs.

## Deploy workflow (established this session, keep following it)

- Bump `BUNDLE_VERSION` in `vite.config.js` for any `.jsx`/`.js` change
  (not needed for data-only or photo-only changes like the above).
- Before running `npm run prerender` locally, patch
  `scripts/prerender.mjs`'s `chromium.launch()` call to
  `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` (this
  sandbox's Chromium path), then revert that patch before committing -
  it must never land in the commit.
- Always regenerate and verify every prerendered page affected by a
  change before committing.
- Grep the diff for em dashes before every commit.
- Keep `scripts/_catalog-snapshot.json` (gitignored) in sync with every
  Supabase write that touches catalog data, so local prerendering reflects
  what's actually live.
- Develop and commit on branch `claude/supabase-mcp-setup-wgb45t`, but
  always fast-forward-push the same commit to `main` afterward -
  **production only deploys from `main`** (confirmed via Vercel: the
  project's production target tracks `main`, not the feature branch).
