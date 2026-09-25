// MANUAL/DEV USE ONLY — run with `npm run prerender` after `npm run build`,
// whenever page content changes, then commit the updated prerendered/
// folder. This does NOT run during the Vercel build (see
// scripts/copy-prerendered.mjs for that): Vercel's build sandbox can't
// reliably launch headless Chromium, so snapshots are generated ahead of
// time here instead and just copied into dist/ at deploy time.
//
// Crawls the already-built site with a headless browser and writes the
// fully-rendered HTML for each route into prerendered/, so search engines,
// AI tools, and link-preview bots (none of which execute JavaScript) see
// real content instead of the empty <div id="root"> shell. Real browsers
// still get the exact same interactive React app — client JS replaces this
// static markup the moment it mounts.
import { preview } from "vite";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildItemPages, loadCatalogSnapshot, loadTableBoxPackagesSnapshot } from "./catalogRoutes.mjs";

const { seoForPath, itemSeo, itemUrlPath } = await import(pathToFileURL(path.resolve("seo.js")).href);

const ROUTES = [
  "/",
  "/how-it-works",
  "/experiences",
  "/about",
  "/faq",
  "/decor",
  "/table-box",
  "/birthdays/tutu-twirls-tea",
  "/milestone-events/baby-shower",
  "/gifts",
  "/catering",
  "/package-builder",
  "/display-options",
  "/past-events",
  "/rental-guide",
  "/reviews",
];

// Pass routes to rebuild only those snapshots, e.g.
// `npm run prerender -- /past-events`. Rebuilding all fifteen takes about
// ten minutes, and a typical change touches one page. An unknown route is
// a hard error rather than a no-op, so a typo can't quietly leave a page's
// snapshot stale while the run still reports success. Catalog item pages
// (see below) are a separate pass and aren't affected by this filter.
function routesToBuild() {
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  if (requested.length === 0) return ROUTES;

  const normalized = requested.map((r) => (r.startsWith("/") ? r : `/${r}`));
  const unknown = normalized.filter((r) => !ROUTES.includes(r));
  if (unknown.length) {
    throw new Error(
      `Unknown route(s): ${unknown.join(", ")}\nKnown routes:\n  ${ROUTES.join("\n  ")}`
    );
  }
  return normalized;
}

// --- Catalog item pages -----------------------------------------------
//
// Every active catalog row gets its own indexable page at /decor/<slug>
// or /gifts/<slug> (see pages/ItemDetail.jsx). This crawl generates a
// static snapshot for each one, the same way it does for the sixteen
// fixed routes above. The route list itself (which items, grouped how)
// comes from scripts/catalogRoutes.mjs, shared with generate-sitemap.mjs.

async function run() {
  const routes = routesToBuild();
  if (routes.length !== ROUTES.length) {
    console.log(`Prerendering ${routes.length} of ${ROUTES.length} routes: ${routes.join(", ")}\n`);
  }

  const server = await preview({ preview: { port: 4173, strictPort: false } });
  const base = server.resolvedUrls.local[0].replace(/\/$/, "");

  const emptyCatalogueRoutes = [];

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Skip the "what are you planning?" picker and the Package Builder's
  // event date gate, so every prerendered snapshot shows real page content
  // instead of a modal or gate screen.
  await page.addInitScript(() => {
    localStorage.setItem("asliceofg-event-type-chosen", "1");
    localStorage.setItem("asliceofg-event-type-id", "babyShower");
    localStorage.setItem("asliceofg-event-date", "2026-06-15");
  });

  // A dev/CI machine that can't reach Supabase (no credentials, or no
  // network route to it at all) still needs a way to get real product
  // data into these snapshots. Drop a scripts/_catalog-snapshot.json
  // (gitignored, JSON array of active `items` rows, id/name/category/
  // description/photos/purchase_price/rental_price/quantity_owned/
  // made_to_order/variant_group/variant_label/size/color/condition_notes)
  // before running this script and, when present, it intercepts the
  // app's own Supabase REST calls and serves them from that file instead
  // of the network. Regenerate it fresh each time (it's a point-in-time
  // copy, not a live source) - query Supabase directly for it, since a
  // plain Node script has no route to Supabase either when this machine
  // doesn't. A machine that reaches Supabase fine can skip this file
  // entirely; it's only a stand-in for the request, not a change to what
  // the app does.
  const catalog = await loadCatalogSnapshot();
  if (catalog) {
    console.log(`Using scripts/_catalog-snapshot.json (${catalog.length} items) to fill Supabase data during this crawl.\n`);
    // A real PostgREST response already reflects the query's own filters
    // (?id=eq.8, ?variant_group=eq.Foo, ...) - supabase-js's .maybeSingle()
    // errors out if it gets back anything other than zero or one rows, so
    // returning the whole snapshot unfiltered for every request (id lookups
    // included) reads as "not found" for every single item. Every filter
    // this app's queries actually use gets applied here the same way.
    await page.route("**/rest/v1/items*", (route) => {
      const url = new URL(route.request().url());
      let rows = catalog;
      const idFilter = url.searchParams.get("id");
      if (idFilter?.startsWith("eq.")) {
        const id = Number(idFilter.slice(3));
        rows = rows.filter((r) => r.id === id);
      }
      const groupFilter = url.searchParams.get("variant_group");
      if (groupFilter?.startsWith("eq.")) {
        const group = decodeURIComponent(groupFilter.slice(3));
        rows = rows.filter((r) => r.variant_group === group);
      }
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(rows) });
    });
    await page.route("**/rest/v1/gifts*", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) })
    );

    // Same stand-in for the Table Box package tables (see
    // components/TableBoxPackages.jsx). Without it the snapshot would bake
    // in "Package options are unavailable" instead of the two boxes.
    const packages = await loadTableBoxPackagesSnapshot();
    if (packages) {
      const serve = (rows) => (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(rows) });
      await page.route(/\/rest\/v1\/table_box_packages\?/, serve(packages.packages));
      await page.route(/\/rest\/v1\/table_box_package_items\?/, serve(packages.items));
      await page.route(/\/rest\/v1\/table_box_package_addons\?/, serve(packages.addons));
    }
  }

  for (const route of routes) {
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const html = await page.content();

    // components/SeoHead.jsx has already written this route's title,
    // description, canonical, social tags and structured data into the
    // live DOM by now, so page.content() captures them without this
    // script having to repeat any of that. What it does have to do is
    // make sure that actually happened: a snapshot that silently keeps
    // the generic shell metadata is the exact failure that leaves every
    // page in Google looking identical, and it is invisible on the page
    // itself. Fail the build instead of shipping it.
    const expected = seoForPath(route);
    const actualTitle = await page.title();
    const actualDescription = await page
      .locator('head meta[name="description"]')
      .getAttribute("content");
    const actualCanonical = await page.locator('head link[rel="canonical"]').getAttribute("href");

    if (actualTitle !== expected.title) {
      throw new Error(`${route}: title is "${actualTitle}", expected "${expected.title}"`);
    }
    if (actualDescription !== expected.description) {
      throw new Error(`${route}: meta description does not match seo.js`);
    }
    if (actualCanonical !== expected.canonical) {
      throw new Error(`${route}: canonical is "${actualCanonical}", expected "${expected.canonical}"`);
    }
    if (!html.includes('"@type":"LocalBusiness"')) {
      throw new Error(`${route}: LocalBusiness structured data missing from snapshot`);
    }

    // The decor and gift grids load live from Supabase, so a crawl that
    // can't reach it (missing VITE_SUPABASE_* credentials, no network
    // route to Supabase, or no catalog snapshot loaded above) ships a
    // catalogue page with no products in it. That's invisible to anyone
    // browsing the live site (the real app fetches fine in a real
    // browser) and completely silent otherwise, but it means Google
    // indexes the page without a single product name on it. Warn rather
    // than throw, so a copy-only prerender still works.
    //
    // /decor's grid defaults to View All and shows real cards right away,
    // same as /gifts - each page just renders a different single action
    // on a real product card (Decor: one "VIEW DETAILS" per card, since
    // the Decor + Gifts Conversion Implementation Plan moved Buy/Rent off
    // the grid entirely; Gifts: "Add to cart" or "View options"), which an
    // empty grid never shows either of.
    const emptyDecor = route === "/decor" && !/VIEW DETAILS/i.test(html);
    const emptyGifts = route === "/gifts" && !/Add to cart|View options/i.test(html);
    if (emptyDecor || emptyGifts) {
      emptyCatalogueRoutes.push(route);
    }

    const outDir = route === "/" ? "prerendered" : path.join("prerendered", route.slice(1));
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), html, "utf-8");
    console.log(`Prerendered ${route === "/" ? "/" : route} -> ${path.join(outDir, "index.html")}`);
  }

  if (emptyCatalogueRoutes.length) {
    console.warn(
      `\nWARNING: ${emptyCatalogueRoutes.join(", ")} was captured with an empty catalogue.\n` +
        "The live site is fine, but the static snapshot search engines read has no\n" +
        "product names in it. Re-run this with the real VITE_SUPABASE_URL and\n" +
        "VITE_SUPABASE_ANON_KEY set (npm run build, then npm run prerender), or with\n" +
        "scripts/_catalog-snapshot.json present, so the catalogue is baked into the\n" +
        "snapshot.\n"
    );
  }

  if (!catalog) {
    console.warn(
      "\nNo scripts/_catalog-snapshot.json found and no other route to Supabase from " +
        "this machine - skipping per-item catalog page prerendering (/decor/<item> and " +
        "/gifts/<item>). Existing item snapshots in prerendered/ are left as they are.\n"
    );
  } else {
    const itemPages = buildItemPages(catalog);
    console.log(`\nPrerendering ${itemPages.length} catalog item pages...`);

    for (const { kind, base: baseItem, groupName } of itemPages) {
      const routePath = itemUrlPath(kind, baseItem, groupName);
      const previousTitle = await page.title();
      // No physical dist/decor/<slug>/index.html file exists yet for a
      // route this loop is only now generating, so a direct page.goto()
      // here falls through to vite preview's SPA fallback, which serves
      // the *prerendered* root snapshot's already-baked-in markup - not
      // an empty shell - and this loop would go on to read that stale
      // content back out as if it were the item page. Navigating instead
      // via the same history.pushState + synthetic popstate event
      // App.jsx's own router listens for gets the real client-side route
      // change without ever asking the server for a path it can't serve.
      await page.evaluate((p) => {
        window.history.pushState({}, "", p);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, routePath);
      // ItemDetail fetches the item after mounting and renders nothing
      // but a loading line until that resolves, so neither networkidle
      // nor a fixed delay reliably lands after it's done, and waiting
      // for an <h1> is no better - every other page already has one
      // (PageHero's own), so that wait resolves instantly against the
      // page being left behind rather than the one arriving. SeoHead
      // only sets document.title once the real item (or the "couldn't
      // find that item" fallback) has actually rendered, and never
      // repeats the previous page's title, so that's the one signal
      // guaranteed to change exactly when this needs it to.
      await page.waitForFunction((prev) => document.title !== prev, previousTitle, { timeout: 10000 });
      await page.waitForTimeout(200);
      const html = await page.content();

      const expected = itemSeo({
        kind,
        name: groupName || baseItem.name,
        description: baseItem.description,
        photo: (baseItem.photos || [])[0],
        path: routePath,
      });
      const actualTitle = await page.title();
      const actualCanonical = await page.locator('head link[rel="canonical"]').getAttribute("href");

      if (actualTitle !== expected.title) {
        throw new Error(`${routePath}: title is "${actualTitle}", expected "${expected.title}"`);
      }
      if (actualCanonical !== expected.canonical) {
        throw new Error(`${routePath}: canonical is "${actualCanonical}", expected "${expected.canonical}"`);
      }
      if (!html.includes('"@type":"Product"')) {
        throw new Error(`${routePath}: Product structured data missing from snapshot`);
      }

      const outDir = path.join("prerendered", routePath.slice(1));
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, "index.html"), html, "utf-8");
      console.log(`Prerendered ${routePath}`);
    }
  }

  await browser.close();
  await new Promise((resolve, reject) =>
    server.httpServer.close((err) => (err ? reject(err) : resolve()))
  );
}

run().catch((err) => {
  console.error("Prerendering failed:", err);
  process.exit(1);
});
