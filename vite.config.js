import react from "@vitejs/plugin-react";

// The build's asset filenames must stay stable across deploys. The
// prerendered/ snapshots (see scripts/prerender.mjs) are static HTML
// committed to the repo, generated once and just copied into dist/ at
// build time (scripts/copy-prerendered.mjs) — they can't launch Chromium
// on every deploy to refresh themselves. Their <script>/<link> tags point
// at literal filenames, so if Vite's default content hashing changed those
// filenames on a later build (e.g. after any content edit), the snapshots
// would reference JS/CSS that no longer exists and real visitors landing
// on a sub-route would get a blank, non-interactive page.
// Bump this whenever a deploy needs to force past a stale cached copy of
// app.js/app.css at any layer between origin and browser (see the /events
// proxy's cache-control history) - it's the whole reason these two
// filenames carry a version instead of Vite's own content hash. Changing
// it means re-running `npm run prerender` before deploying, since the
// static snapshots' <script>/<link> tags hardcode the current name.
const BUNDLE_VERSION = "v21";

export default {
  base: "/events/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app.${BUNDLE_VERSION}.js`,
        chunkFileNames: "assets/[name].js",
        // Only the CSS needs a stable name (it's referenced by a <link> tag
        // baked into the static snapshots too). Images etc. keep normal
        // content hashing — they're only ever referenced from inside the
        // JS bundle, so a changed hash there is always self-consistent.
        assetFileNames: (info) =>
          info.name && info.name.endsWith(".css")
            ? `assets/app.${BUNDLE_VERSION}.css`
            : "assets/[name]-[hash][extname]",
      },
    },
  },
};
