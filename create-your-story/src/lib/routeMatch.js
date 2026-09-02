// Tiny `:param` matcher for the hand-rolled router in App.jsx. Mirrors the
// marketing site's pushState-router pattern, extended just enough for the
// dynamic segments this app needs (/g/:eventCode, /live/:eventCode, ...).
// Kept dependency-free on purpose: this app has ~9 static routes, well within
// what a router library would buy over a 30-line matcher.

export function matchRoute(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return null;
    }
  }
  return params;
}
