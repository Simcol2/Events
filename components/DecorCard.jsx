import React from "react";
import PhotoCarousel, { normalizePhotos } from "./PhotoCarousel";
import { itemAltText } from "../seo";

// Gift wrap and disposables are purchase-only by business rule, enforced
// here rather than relying only on the sheet leaving rental_price blank.
// Matched case-insensitively since the sheet's tags column is typed by
// hand.
const PURCHASE_ONLY_TAGS = ["gift wrap", "disposables"];

// The `tags` column exists but the sheet-driven data entry workflow has
// always populated the multi-value tag list into `category` instead (a
// comma-separated string, e.g. "Table, Showers, Birthdays/Holidays") -
// this is why filtering and the tag display both silently showed nothing
// before. `tags` is checked first so a populated tags array (e.g. from
// the admin page) always wins, but category is where the real data lives
// today.
export function parseItemTags(item) {
  if (Array.isArray(item.tags) && item.tags.length) return item.tags.filter(Boolean);
  if (typeof item.category === "string" && item.category.trim()) {
    return item.category.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

// The tags Decor.jsx's category picker actually offers - kept here as the
// one shared definition so a row's "would this ever appear somewhere on
// the decor page" question always gets the same answer everywhere it's
// asked. pages/Decor.jsx imports this directly for its own category
// pills; decorTags.js is a separate, larger set of display labels (every
// tag the admin form can apply), not a second source of truth for it.
export const DECOR_CATEGORY_TAGS = [
  "table", "wall/floor", "signage", "equipment",
  "marquee letters & numbers", "guest keepsakes", "disposables", "dessert & serve",
  "complete looks",
];

export function isDecorCatalogItem(item) {
  return parseItemTags(item)
    .map((t) => t.toLowerCase().trim())
    .some((t) => DECOR_CATEGORY_TAGS.includes(t));
}

// Mirrors pages/Gifts.jsx's own giftItems/wrapAndStationeryItems split:
// gift wrap and stationery rows unconditionally, guest keepsakes rows
// only once they're actually purchasable.
export function isGiftCatalogItem(item) {
  const tags = parseItemTags(item).map((t) => t.toLowerCase().trim());
  if (tags.includes("gift wrap") || tags.includes("stationery")) return true;
  return tags.includes("guest keepsakes") && item.purchase_price != null;
}

// An item's `color` column can hold a single value ("Gold") or, for a
// single catalog row that comes in more than one finish (e.g. the wine
// glasses, sold as one line item in Gold or Crystal Clear), a
// comma-separated list - same convention as `category`'s tag list. A
// single value renders as plain text; more than one renders as a
// dropdown so the shopper can indicate which they want.
export function parseColorOptions(item) {
  if (typeof item.color !== "string" || !item.color.trim()) return [];
  return item.color.split(",").map((c) => c.trim()).filter(Boolean);
}

// Catalog descriptions can carry **bold** lead-ins and blank-line breaks
// for the detail view, which renders them as real formatting. Everywhere
// that shows the same text as a plain one or two line preview strips the
// markers instead of printing literal asterisks.
export function plainDescription(text) {
  if (typeof text !== "string") return text;
  return text.replace(/\*\*/g, "").replace(/\s*\n+\s*/g, " ").trim();
}

// Shared by DecorCard and ItemDetail so the purchase-only rule and
// the tag list only live in one place.
export function getItemFlags(item) {
  const tags = parseItemTags(item);
  const outOfStock = !item.made_to_order && (item.quantity_owned ?? 0) <= 0;
  const isPurchasable = item.purchase_price != null;
  const isPurchaseOnly = tags.some((t) => PURCHASE_ONLY_TAGS.includes(String(t).toLowerCase().trim()));
  const isRentable = item.rental_price != null && !isPurchaseOnly;
  return { tags, outOfStock, isPurchasable, isRentable };
}

// `variants`, when passed, is every catalog row sharing the same
// variant_group (e.g. the Large and Small rows for the same candle
// holders). The card shows one shared photo/price/name area driven by
// whichever variant is currently selected in the dropdown, instead of a
// separate card per row. `groupName` is the shared display name (the
// variant_group value) used in place of the individual row's own name.
function variantPrice(v) {
  const rent = v.rental_price != null ? Number(v.rental_price) : null;
  const buy = v.purchase_price != null ? Number(v.purchase_price) : null;
  if (rent != null && buy != null) return Math.min(rent, buy);
  return rent ?? buy ?? Infinity;
}

// Sizing/price choices are made on the item's own detail page, not
// on the grid - a dropdown per card reads as clunky at a glance. The grid
// just needs to default to the cheapest variant (the smallest size, in
// practice) so the photo and starting price it shows are representative.
export function sortVariantsByPrice(list) {
  return [...list].sort((a, b) => variantPrice(a) - variantPrice(b));
}

// Rows sharing a variant_group (pack sizes, sizes, treat options) collapse
// into a single card so a catalogue page never shows the same photo eight
// times in a row. Every page that lists catalog items runs its own filtered
// set through this, so a group only ever forms from rows that page is
// already showing.
// One short, factual line per card (plan: "dimensions, quantity,
// freestanding or tabletop status, set size, rotating, illuminated, or
// what is included"). Only ever built from columns that are already
// trustworthy structured data - never invented or inferred from free
// text - so a blank result (nothing applies) is preferred over a guess.
export function diagnosticLine({ item, hasVariants, colorOptions }) {
  if (hasVariants) return "Multiple sizes available";
  if (item.size) return item.size;
  if (colorOptions.length > 1) return `${colorOptions.length} finishes available`;
  if (item.made_to_order) return "Made to order";
  if (item.quantity_owned != null && item.quantity_owned > 0 && item.quantity_owned <= 5) {
    return `${item.quantity_owned} available`;
  }
  return "";
}

export function groupByVariant(items) {
  const seen = new Set();
  const groups = [];

  for (const item of items) {
    const key = item.variant_group?.trim();
    if (!key) {
      groups.push({ key: `item-${item.id}`, item, variants: null });
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);

    const variants = sortVariantsByPrice(items.filter((i) => i.variant_group?.trim() === key));
    groups.push({ key, item: variants[0], variants, groupName: key });
  }

  return groups;
}

// One primary action per card (VIEW DETAILS) - sizing, color, and the
// actual Buy/Rent choice all happen on the item's own detail page once
// someone clicks through, never here. See onOpenDetail.
export default function DecorCard({ item, variants, groupName, onOpenDetail }) {
  const hasVariants = Array.isArray(variants) && variants.length > 1;
  // The grid always shows the cheapest/default variant - selecting a
  // different size or color happens after clicking through to the detail
  // view (see onOpenDetail below), so there's no local selection state to
  // track here anymore.
  const active = hasVariants ? sortVariantsByPrice(variants)[0] : item;

  const { tags, outOfStock, isPurchasable, isRentable } = getItemFlags(active);
  const displayName = hasVariants ? groupName || active.name : active.name;
  const colorOptions = parseColorOptions(active);
  const startingPrice = hasVariants ? Math.min(...variants.map(variantPrice)) : null;
  const startingIsRental = hasVariants
    ? sortVariantsByPrice(variants).find((v) => variantPrice(v) === startingPrice)?.rental_price != null
    : null;
  const diagLine = diagnosticLine({ item: active, hasVariants, colorOptions });

  const priceLabel = hasVariants
    ? `FROM $${startingPrice}${startingIsRental ? " / EVENT" : ""}`
    : isRentable && isPurchasable
      ? `RENT $${active.rental_price} · BUY $${active.purchase_price}`
      : isRentable
        ? `RENT $${active.rental_price} / EVENT`
        : isPurchasable
          ? `BUY $${active.purchase_price}`
          : "INQUIRE";

  return (
    <article
      onClick={() => onOpenDetail?.(active, variants, groupName)}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border border-[#E6E6E6] bg-white transition-shadow hover:shadow-md ${outOfStock ? "opacity-60" : ""}`}
      style={{ boxShadow: "0 1px 2px rgba(41,41,41,0.04), 0 10px 22px rgba(41,41,41,0.06)" }}
    >
      <div className="relative aspect-[4/4.6] overflow-hidden bg-[#EEE9DC]">
        {normalizePhotos(active.photos).length ? (
          <PhotoCarousel
            photos={active.photos}
            alt={itemAltText(displayName, { color: colorOptions[0] })}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-[Space_Grotesk] text-sm tracking-[0.2em] text-[#6B6B6B]">PHOTO COMING SOON</span>
          </div>
        )}
        {outOfStock && (
          <div className="absolute left-3 top-3 bg-[#FFFFFF]/95 px-3 py-1.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em] text-[#6B6B6B]">
            OUT OF STOCK
          </div>
        )}
      </div>

      <div className="flex min-h-[130px] flex-1 flex-col gap-1 px-4 pb-4 pt-4 sm:min-h-[150px]">
        <div className="font-[Space_Grotesk] text-[10px] font-medium uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-xs sm:tracking-[0.16em]">
          {tags[0] || "Decor"}
        </div>
        <h3
          className="font-['Fraunces'] text-lg font-semibold leading-[1.1] text-[#0B4933] sm:text-[22px] sm:leading-[1.05]"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {displayName}
        </h3>
        {diagLine && (
          <div
            className="font-[Space_Grotesk] text-xs text-[#8C846F]"
            style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {diagLine}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#E6E6E6] pt-3">
          <span className="font-[Space_Grotesk] text-xs font-medium tracking-[0.06em] text-[#8A6A1E] sm:text-sm sm:tracking-[0.08em]">
            {outOfStock ? "UNAVAILABLE" : priceLabel}
          </span>
          <span className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-[#0B4933] sm:text-sm sm:tracking-[0.14em]">
            VIEW DETAILS
          </span>
        </div>
      </div>
    </article>
  );
}
