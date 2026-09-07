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

const { seoForPath } = await import(pathToFileURL(path.resolve("seo.js")).href);

const ROUTES = [
  "/",
  "/how-it-works",
  "/experiences",
  "/about",
  "/faq",
  "/decor",
  "/activities",
  "/gifts",
  "/catering",
  "/package-builder",
  "/display-options",
  "/past-events",
  "/rental-guide",
  "/reviews",
];

async function run() {
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

  for (const route of ROUTES) {
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

    // The decor and gift grids are loaded live from Supabase, so a build
    // run without real VITE_SUPABASE_* credentials captures the loading
    // state and ships a catalogue page with no products in it. That is
    // invisible to anyone browsing the site (the live app fetches fine)
    // and completely silent, but it means Google indexes the two pages
    // most worth indexing without a single product name on them. Warn
    // rather than throw, so a copy-only prerender still works.
    if (route === "/decor" && /Curating the collection/.test(html)) {
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
        "VITE_SUPABASE_ANON_KEY set (npm run build, then npm run prerender) so the\n" +
        "catalogue is baked into the snapshot.\n"
    );
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
