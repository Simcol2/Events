import { useEffect } from "react";
import {
  seoForPath,
  breadcrumbJsonLd,
  localBusinessJsonLd,
  websiteJsonLd,
  SITE_NAME,
  SITE_URL,
} from "../seo";

// Keeps <head> in sync with the current route. The router in App.jsx is
// hand-rolled (history.pushState + state), so nothing updates the title,
// description, or canonical URL on navigation unless something does it
// explicitly - which matters for the crawlers that DO run JavaScript
// (Googlebot among them) and for anyone who bookmarks or shares a page
// after clicking through the site.
//
// The static snapshots in prerendered/ carry the same tags stamped in at
// build time by scripts/prerender.mjs, so a bot that never runs JS gets
// identical metadata. This hook only has to handle the in-app case.

function setMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(attrs.tag || "meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "tag") return;
    if (v === null || v === undefined) el.removeAttribute(k);
    else el.setAttribute(k, v);
  });
  return el;
}

// The two site-wide blocks. index.html ships them as empty placeholders
// and scripts/prerender.mjs fills them for the static snapshots; this
// fills them for anything served from the raw shell, so the page never
// carries an empty ld+json tag.
function fillSiteJsonLd() {
  [
    ["business", localBusinessJsonLd],
    ["website", websiteJsonLd],
  ].forEach(([key, build]) => {
    let el = document.head.querySelector(`script[data-seo="${key}"]`);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.seo = key;
      document.head.appendChild(el);
    }
    const current = (el.textContent || "").trim();
    if (!current || current === "{}") el.textContent = JSON.stringify(build());
  });
}

export default function SeoHead({ path }) {
  useEffect(fillSiteJsonLd, []);

  useEffect(() => {
    const { title, description, canonical, noindex } = seoForPath(path);

    document.title = title;

    setMeta('meta[name="description"]', { tag: "meta", name: "description", content: description });
    setMeta('link[rel="canonical"]', { tag: "link", rel: "canonical", href: canonical });

    // Robots: public pages get the full treatment (including the larger
    // image preview, which is what makes a rental listing worth clicking).
    // The tokenised review link and the staff inventory tools get kept out
    // of the index entirely.
    setMeta('meta[name="robots"]', {
      tag: "meta",
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1",
    });

    setMeta('meta[property="og:title"]', { tag: "meta", property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { tag: "meta", property: "og:description", content: description });
    setMeta('meta[property="og:url"]', { tag: "meta", property: "og:url", content: canonical });
    setMeta('meta[property="og:type"]', { tag: "meta", property: "og:type", content: "website" });
    setMeta('meta[property="og:site_name"]', { tag: "meta", property: "og:site_name", content: SITE_NAME });
    setMeta('meta[property="og:locale"]', { tag: "meta", property: "og:locale", content: "en_CA" });
    setMeta('meta[property="og:image"]', { tag: "meta", property: "og:image", content: `${SITE_URL}/og-cover.jpg` });

    setMeta('meta[name="twitter:card"]', { tag: "meta", name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { tag: "meta", name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { tag: "meta", name: "twitter:description", content: description });

    // Breadcrumb structured data is per-page, so it is replaced on every
    // navigation. The site-wide LocalBusiness and WebSite blocks live in
    // index.html and never change, so they are left alone here.
    const existing = document.head.querySelector('script[data-seo="breadcrumb"]');
    if (existing) existing.remove();
    const crumb = breadcrumbJsonLd(path);
    if (crumb) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seo = "breadcrumb";
      script.textContent = JSON.stringify(crumb);
      document.head.appendChild(script);
    }
  }, [path]);

  return null;
}
