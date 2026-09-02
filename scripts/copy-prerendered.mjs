// Copies the committed prerendered/ snapshots over vite's plain dist/*.html
// shells after the build. No browser needed here — that's the whole point:
// Vercel's build sandbox can't reliably launch headless Chromium, so the
// snapshots are generated ahead of time (see scripts/prerender.mjs, run
// locally/manually whenever page content changes) and just copied in.
import { cp, readdir } from "node:fs/promises";
import path from "node:path";

const SRC_ROOT = path.resolve("prerendered");
const DEST_ROOT = path.resolve("dist");

async function run() {
  const entries = await readdir(SRC_ROOT, { withFileTypes: true });

  for (const entry of entries) {
    const src = path.join(SRC_ROOT, entry.name);
    const dest = path.join(DEST_ROOT, entry.name);
    await cp(src, dest, { recursive: true });
    console.log(`Copied prerendered/${entry.name} -> dist/${entry.name}`);
  }
}

run().catch((err) => {
  console.error("Copying prerendered snapshots failed:", err);
  process.exit(1);
});
