// The app is deployed under asliceofg.com/events (see App.jsx's matching
// BASE_PATH), so any absolute reference to this app's own routes or its
// /api/* serverless functions needs that prefix too - a bare "/client" or
// fetch("/api/...") would resolve against the rum cake business's domain
// space instead of this app. Both derived from Vite's own `base`
// (vite.config.js) so they can never drift apart.
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
export const API_BASE = `${BASE_PATH}/api`;

// `public/photos/*` files are copied to dist/photos/* as-is - Vite's
// `base` only rewrites URLs it processes through the bundler (imports,
// the built HTML's own script/link tags), never a literal "/photos/..."
// string used directly as an <img src>. Every such string, whether typed
// in this codebase or stored in a Supabase item's `photos` column, needs
// to go through this before it reaches the DOM, or it resolves against
// the rum cake business's domain space instead of this app's own dist/.
// Anything that isn't a root-relative path (an absolute https:// URL, or
// a Vite-imported asset already resolved to a hashed /events/assets/...
// URL) passes through unchanged.
export function withBasePath(url) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith(BASE_PATH + "/")) return url;
  return `${BASE_PATH}${url}`;
}
