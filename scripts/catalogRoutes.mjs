// Node-safe (no JSX) catalog-routing helpers shared by scripts/prerender.mjs
// and scripts/generate-sitemap.mjs - both need the same answer to "what are
// every catalog item's URLs", and this is the one place that logic lives for
// either script to import.
//
// It duplicates a small amount of logic that otherwise lives in
// components/DecorCard.jsx, pages/Decor.jsx and pages/Gifts.jsx - kept in
// sync by hand rather than imported, because those are .jsx files and these
// scripts run as plain Node with no JSX transform, the same reason seo.js
// stays JSX-free. If the category tag lists or grouping rule change on
// those pages, update them here too.
import { readFile } from "node:fs/promises";
import path from "node:path";

export const DECOR_CATEGORY_TAGS = [
  "table", "wall/floor", "signage", "equipment",
  "marquee letters & numbers", "keepsakes & gifts", "disposables", "dessert items",
];

export function parseTags(item) {
  if (typeof item.category === "string" && item.category.trim()) {
    return item.category.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

export function isDecorCatalogItem(item) {
  return parseTags(item).some((t) => DECOR_CATEGORY_TAGS.includes(t));
}

export function isGiftCatalogItem(item) {
  const tags = parseTags(item);
  if (tags.includes("gift wrap") || tags.includes("stationery")) return true;
  return tags.includes("keepsakes & gifts") && item.purchase_price != null;
}

function variantPrice(v) {
  const rent = v.rental_price != null ? Number(v.rental_price) : null;
  const buy = v.purchase_price != null ? Number(v.purchase_price) : null;
  if (rent != null && buy != null) return Math.min(rent, buy);
  return rent ?? buy ?? Infinity;
}

// Collapses rows sharing a variant_group into one entry (the cheapest
// variant within `items`), matching components/DecorCard.jsx's
// groupByVariant() run against that same already-filtered list.
export function groupItems(items) {
  const seen = new Set();
  const groups = [];
  for (const item of items) {
    const key = item.variant_group?.trim();
    if (!key) {
      groups.push({ base: item, groupName: null });
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    const variants = items.filter((i) => i.variant_group?.trim() === key).sort((a, b) => variantPrice(a) - variantPrice(b));
    groups.push({ base: variants[0], groupName: key });
  }
  return groups;
}

export async function loadCatalogSnapshot() {
  try {
    const raw = await readFile(path.resolve("scripts/_catalog-snapshot.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// One { kind, base, groupName } entry per catalog item page the app can
// actually reach - the same set pages/Decor.jsx and pages/Gifts.jsx would
// each show, deduplicated and priced the same way.
export function buildItemPages(catalog) {
  const decorItems = catalog.filter(isDecorCatalogItem);
  const giftItems = catalog.filter(isGiftCatalogItem);

  const pages = [];
  for (const { base, groupName } of groupItems(decorItems)) pages.push({ kind: "decor", base, groupName });
  for (const { base, groupName } of groupItems(giftItems)) pages.push({ kind: "gifts", base, groupName });
  return pages;
}
