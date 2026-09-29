// Copies the committed prerendered/ snapshots over vite's plain dist/*.html
// shells after the build. No browser needed here — that's the whole point:
// Vercel's build sandbox can't reliably launch headless Chromium, so the
// snapshots are generated ahead of time (see scripts/prerender.mjs, run
// locally/manually whenever page content changes) and just copied in.
import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC_ROOT = path.resolve("prerendered");
const DEST_ROOT = path.resolve("dist");

async function run() {
  // Read Vite's fresh shell before saved HTML overwrites it. Always bind
  // snapshots to this build's bundles, even if their committed refs are stale.
  const shell = await readFile(path.join(DEST_ROOT, "index.html"), "utf8");
  const bundleNames = {};
  for (const match of shell.matchAll(/assets\/(app(?:\.[\w-]+)?\.(js|css))/g)) {
    bundleNames[match[2]] = match[1];
  }
  if (!bundleNames.js || !bundleNames.css) {
    throw new Error("Could not identify the built JavaScript and CSS bundles.");
  }

  async function updateBundleReferences(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await updateBundleReferences(file);
      } else if (entry.name.endsWith(".html")) {
        const html = await readFile(file, "utf8");
        const updated = html.replace(/assets\/app(?:\.[\w-]+)?\.(js|css)/g,
          (_, extension) => "assets/" + bundleNames[extension]);
        if (updated !== html) await writeFile(file, updated);
      }
    }
  }

  const entries = await readdir(SRC_ROOT, { withFileTypes: true });

  for (const entry of entries) {
    const src = path.join(SRC_ROOT, entry.name);
    const dest = path.join(DEST_ROOT, entry.name);
    await cp(src, dest, { recursive: true });
    console.log(`Copied prerendered/${entry.name} -> dist/${entry.name}`);
  }
  await updateBundleReferences(DEST_ROOT);
}

run().catch((err) => {
  console.error("Copying prerendered snapshots failed:", err);
  process.exit(1);
});
