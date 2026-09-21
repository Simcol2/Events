// Writes public/sitemap.xml from the single list of indexable routes in
// seo.js, plus every catalog item's own page, so a page added there (or a
// product added to the catalog) cannot be left out of the sitemap by
// hand. Runs as part of `npm run build`, before vite copies public/ into
// dist/, which means the deployed sitemap is always current with the
// deployed routes.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildItemPages, loadCatalogSnapshot } from "./catalogRoutes.mjs";

const { SITE_URL, INDEXABLE_ROUTES, itemUrlPath } = await import(pathToFileURL(path.resolve("seo.js")).href);

// Crawl priority reflects what actually earns the business money: the
// homepage and the browsable catalogue pages first, policy and story
// pages after.
const PRIORITY = {
  "/": "1.0",
  "/decor": "0.9",
  "/display-options": "0.9",
  "/package-builder": "0.9",
  "/experiences": "0.8",
  "/milestone-events/baby-shower": "0.9",
  "/gifts": "0.8",
  "/catering": "0.8",
  "/how-it-works": "0.7",
  "/rental-guide": "0.7",
  "/past-events": "0.6",
  "/reviews": "0.6",
  "/about": "0.5",
  "/faq": "0.5",
};

const lastmod = new Date().toISOString().slice(0, 10);

const urlBlock = (loc, changefreq, priority) =>
  ["  <url>", `    <loc>${loc}</loc>`, `    <lastmod>${lastmod}</lastmod>`, `    <changefreq>${changefreq}</changefreq>`, `    <priority>${priority}</priority>`, "  </url>"].join("\n");

const fixedUrls = INDEXABLE_ROUTES.map((route) =>
  urlBlock(
    `${SITE_URL}${route === "/" ? "/" : route}`,
    route === "/" || route === "/decor" ? "weekly" : "monthly",
    PRIORITY[route] || "0.5"
  )
);

// Catalog item pages need the same snapshot prerender.mjs uses (see that
// file's own comments on why): this machine has no other route to
// Supabase for real product data either. Skipped, not failed, when it's
// missing - a sitemap that's momentarily short a few hundred product URLs
// still ships the sixteen pages that matter most.
const catalog = await loadCatalogSnapshot();
const itemUrls = catalog
  ? buildItemPages(catalog).map(({ kind, base, groupName }) =>
      urlBlock(`${SITE_URL}${itemUrlPath(kind, base, groupName)}`, "monthly", kind === "decor" ? "0.7" : "0.6")
    )
  : [];
if (!catalog) {
  console.warn("No scripts/_catalog-snapshot.json found - sitemap will not include catalog item pages this run.");
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...fixedUrls, ...itemUrls].join("\n")}
</urlset>
`;

const out = path.resolve("public", "sitemap.xml");
await writeFile(out, xml, "utf-8");
console.log(`Wrote ${fixedUrls.length + itemUrls.length} URLs to public/sitemap.xml (${fixedUrls.length} fixed, ${itemUrls.length} catalog items)`);
