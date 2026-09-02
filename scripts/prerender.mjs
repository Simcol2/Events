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

const ROUTES = ["/", "/decor", "/activities", "/design", "/how-it-works", "/package-builder", "/past-events"];

async function run() {
  const server = await preview({ preview: { port: 4173, strictPort: false } });
  const base = server.resolvedUrls.local[0].replace(/\/$/, "");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Skip the "what are you planning?" picker so every prerendered snapshot
  // shows real page content (default event type) instead of the modal.
  await page.addInitScript(() => {
    localStorage.setItem("asliceofg-event-type-chosen", "1");
    localStorage.setItem("asliceofg-event-type-id", "babyShower");
  });

  for (const route of ROUTES) {
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const html = await page.content();

    const outDir = route === "/" ? "prerendered" : path.join("prerendered", route.slice(1));
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), html, "utf-8");
    console.log(`Prerendered ${route === "/" ? "/" : route} -> ${path.join(outDir, "index.html")}`);
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
