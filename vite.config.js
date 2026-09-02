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
export default {
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/[name].js",
        // Only the CSS needs a stable name (it's referenced by a <link> tag
        // baked into the static snapshots too). Images etc. keep normal
        // content hashing — they're only ever referenced from inside the
        // JS bundle, so a changed hash there is always self-consistent.
        assetFileNames: (info) =>
          info.name && info.name.endsWith(".css")
            ? "assets/app.css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
};
