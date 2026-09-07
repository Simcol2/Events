# A Slice of G Events

Website and booking flow for A Slice of G Events (asliceofg.com), a Toronto/GTA
interactive event experience rental business. React (Vite) single-page app,
Supabase (Postgres) backend, deployed on Vercel.

## HIGH PRIORITY: finish the SEO setup

The site's on-page SEO is built and deployed (per-page titles and
descriptions, structured data, sitemap, image alt text). Four things are
left, and they need a person, not code. They are listed hardest-hitting
first. Steps 1 and 2 are the two that actually move rankings.

### 1. Submit the site to Google Search Console

Until this is done, Google finds pages slowly and you have no visibility
into what it thinks of the site. About 15 minutes.

1. Go to https://search.google.com/search-console and sign in with the
   Google account you want to own this.
2. Click **Add property** and choose the **URL prefix** option on the
   right. Enter `https://asliceofg.com` and click Continue.
3. Google asks you to verify you own the domain. Choose the **HTML tag**
   method. It gives you a line that looks like
   `<meta name="google-site-verification" content="SOME-LONG-CODE" />`.
   Copy that whole line and send it over, and it gets added to
   `index.html` and deployed. Then come back and click **Verify**.
   (Alternative: if you have access to wherever the asliceofg.com domain
   was bought, the **Domain** property option verifies through a DNS
   record instead and covers every subdomain at once. Either works.)
4. Once verified, open **Sitemaps** in the left sidebar, type
   `sitemap.xml` into the box, and click **Submit**.
5. Open **URL Inspection** at the top, paste `https://asliceofg.com`,
   and click **Request indexing**. Repeat for `/decor` and
   `/display-options`. This is the nudge that gets pages looked at in
   days instead of weeks.

Check back in about a week. **Performance** shows what people searched
to find you. **Pages** shows anything Google refused to index and why.

### 2. Set up a Google Business Profile

For a local rental business this outranks almost everything else. It is
what puts you in the map results when somebody searches "backdrop rental
near me". Free.

1. Go to https://business.google.com and click **Manage now**.
2. Business name: **A Slice of G Events**. Category: **Party Equipment
   Rental Service** (add "Event Planner" as a secondary category).
3. When asked whether you have a physical location customers visit,
   answer **No**, then set your **service area** to Toronto plus the GTA
   cities in `SERVICE_CITIES` in `seo.js`. This keeps your home address
   private while still showing you in local results.
4. Add the website `https://asliceofg.com`, your contact email, and your
   hours.
5. Upload at least ten real photos. Past events, display walls, and
   styled tables. Photos are the single biggest factor in how many people
   click through from a map listing.
6. Google mails a postcard with a verification code, or verifies by
   phone or video. It takes a few days. Nothing shows publicly until this
   is finished, so do not skip it.

Once the profile is live, grab its review link and set it as the
`VITE_GOOGLE_REVIEW_URL` environment variable in Vercel. That is what the
post-rental review emails point customers at.

### 3. Bake the decor catalogue into the static pages

Right now the `/decor` page that search engines read has **no product
names on it at all**. The catalogue loads live from Supabase, and the
static snapshot is generated without database credentials, so it captures
the loading state. Real visitors see the products fine. Google does not.

To fix, run the build and prerender with the real Supabase values, then
commit the result:

```
VITE_SUPABASE_URL=<your project URL> \
VITE_SUPABASE_ANON_KEY=<your anon key> \
npm run build && npm run prerender
```

Both values are from Supabase > Project Settings > API. The anon key is
designed to be public and is already in the deployed site, so there is no
risk in using it here. `npm run prerender` prints a warning if the
catalogue still came out empty, so you will know either way.

### 4. Rewrite the catalogue descriptions for search

The decor and gift descriptions live in Supabase, not in this repo, so
they were not part of the SEO pass. Each one should name what the item
is, what it is used for, and where, in one natural sentence. The pattern:

> Modern wine glasses available to rent for weddings, dinner parties,
> baby showers, corporate events and other celebrations in Toronto and
> the GTA.

Editable through `/admin` or the Google Sheet. Ask and this can be done
in bulk.

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

## Admin page

`/admin` is a password-protected internal page for managing the Gifts and
Decor Items catalogs without touching Supabase or the Google Sheet
directly: add, edit, delete, upload/reorder/delete photos (drag the one
you want first, that's the cover photo everywhere on the site), manage
decor tags as checkboxes, and manage a customizable gift's preset
designs. It's deliberately not linked from the site's nav or footer,
reachable only by typing the URL.

**Required environment variables in Vercel** (Project Settings >
Environment Variables), neither one prefixed with `VITE_` since that
would bundle it into the public site's client-side code:

- `ADMIN_PASSCODE`: whatever passcode you want to gate the page with. The
  browser remembers it after the first successful entry (stored in
  localStorage, not a real session), so it only needs to be typed in once
  per device.
- `SUPABASE_SERVICE_ROLE_KEY`: from Supabase > Project Settings > API. The
  admin API routes (`api/admin-items.js`, `api/admin-gifts.js`,
  `api/admin-upload.js`) use this to write past RLS - the public site
  never sees this key, only the server-side functions do.

Photo uploads go into the same `Photos from` Supabase Storage bucket every
existing photo URL in this app already points to. The browser downsizes a
photo to at most 1600px wide before uploading, both to stay comfortably
under Vercel's request size limit and because nothing on the site
displays anything larger.

Since the admin page writes to Supabase directly, editing an item there
and editing the same item's row in the Google Sheet afterward will
conflict, whichever one syncs/loads last wins. Pick one source per item
rather than switching back and forth.

## Repo layout

- `pages/`: top-level routed pages
- `components/`: shared UI components
- `*Content.js` (`packageContent.js`, `cateringContent.js`, `eventConfig.js`):
  copy, pricing, and pool data for the site and the Package Builder
- `api/`: Vercel serverless functions (Stripe checkout, and the
  `admin-*`/`_adminAuth.js` routes behind the admin page above)
- `supabase/`: SQL setup scripts, run once each in the Supabase SQL editor
- `scripts/`: build-time and reference tooling (prerendering, the Google
  Apps Script reference copy above)
