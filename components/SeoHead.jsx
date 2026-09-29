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

// `override` lets a page supply its own title/description/canonical
// instead of the static ROUTE_SEO lookup - every catalog item's detail
// page needs this, since their metadata comes from the item Supabase
// returns, not something that can be hardcoded per route ahead of time.
// `productJsonLd` is an additional structured-data block those same pages
// pass in; it's replaced on every navigation same as the breadcrumb block.
// `extraJsonLd` is a list of further structured-data objects (a package
// page's FAQ, for example), replaced the same way.
export default function SeoHead({ path, override, productJsonLd, extraJsonLd }) {
  useEffect(fillSiteJsonLd, []);

  useEffect(() => {
    const { title, description, canonical, noindex } = override || seoForPath(path);

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
    setMeta('meta[property="og:type"]', { tag: "meta", property: "og:type", content: override ? "product" : "website" });
    setMeta('meta[property="og:site_name"]', { tag: "meta", property: "og:site_name", content: SITE_NAME });
    setMeta('meta[property="og:locale"]', { tag: "meta", property: "og:locale", content: "en_CA" });
    setMeta('meta[property="og:image"]', { tag: "meta", property: "og:image", content: override?.image || `${SITE_URL}/og-cover.jpg` });

    // Alt text for the share image, and the price tags Facebook and
    // Pinterest read on product pages. Removed again on pages without them
    // so one page's values never leak onto the next during in-app navigation.
    const shareImage = override?.image || `${SITE_URL}/og-cover.jpg`;
    const optionalMeta = {
      'meta[property="og:image:alt"]': { property: "og:image:alt", content: override?.imageAlt },
      'meta[name="twitter:image:alt"]': { name: "twitter:image:alt", content: override?.imageAlt },
      'meta[property="product:price:amount"]': { property: "product:price:amount", content: override?.price },
      'meta[property="product:price:currency"]': {
        property: "product:price:currency",
        content: override?.price ? "CAD" : undefined,
      },
    };
    Object.entries(optionalMeta).forEach(([selector, attrs]) => {
      if (attrs.content) setMeta(selector, { tag: "meta", ...attrs });
      else document.head.querySelector(selector)?.remove();
    });

    setMeta('meta[name="twitter:card"]', { tag: "meta", name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:image"]', { tag: "meta", name: "twitter:image", content: shareImage });
    setMeta('meta[name="twitter:title"]', { tag: "meta", name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { tag: "meta", name: "twitter:description", content: description });

    // Breadcrumb structured data is per-page, so it is replaced on every
    // navigation. The site-wide LocalBusiness and WebSite blocks live in
    // index.html and never change, so they are left alone here.
    const existing = document.head.querySelector('script[data-seo="breadcrumb"]');
    if (existing) existing.remove();
    const crumb = breadcrumbJsonLd(path, override?.title);
    if (crumb) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seo = "breadcrumb";
      script.textContent = JSON.stringify(crumb);
      document.head.appendChild(script);
    }

    // Product structured data only exists for catalog item pages, passed
    // in by ItemDetail once the item has loaded from Supabase.
    const existingProduct = document.head.querySelector('script[data-seo="product"]');
    if (existingProduct) existingProduct.remove();
    if (productJsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seo = "product";
      script.textContent = JSON.stringify(productJsonLd);
      document.head.appendChild(script);
    }
    document.head.querySelectorAll('script[data-seo^="extra-"]').forEach((node) => node.remove());
    (extraJsonLd || []).forEach((block, index) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seo = `extra-${index}`;
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
    });
  }, [path, override, productJsonLd, extraJsonLd]);

  return null;
}
