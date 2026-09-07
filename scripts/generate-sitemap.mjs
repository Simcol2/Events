// Writes public/sitemap.xml from the single list of indexable routes in
// seo.js, so a page added there cannot be left out of the sitemap by
// hand. Runs as part of `npm run build`, before vite copies public/ into
// dist/, which means the deployed sitemap is always current with the
// deployed routes.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { SITE_URL, INDEXABLE_ROUTES } = await import(pathToFileURL(path.resolve("seo.js")).href);

// Crawl priority reflects what actually earns the business money: the
// homepage and the browsable catalogue pages first, policy and story
// pages after.
const PRIORITY = {
  "/": "1.0",
  "/decor": "0.9",
  "/display-options": "0.9",
  "/package-builder": "0.9",
  "/experiences": "0.8",
  "/activities": "0.8",
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

const urls = INDEXABLE_ROUTES.map((route) => {
  const loc = `${SITE_URL}${route === "/" ? "/" : route}`;
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${route === "/" || route === "/decor" ? "weekly" : "monthly"}</changefreq>`,
    `    <priority>${PRIORITY[route] || "0.5"}</priority>`,
    "  </url>",
  ].join("\n");
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const out = path.resolve("public", "sitemap.xml");
await writeFile(out, xml, "utf-8");
console.log(`Wrote ${INDEXABLE_ROUTES.length} URLs to public/sitemap.xml`);
