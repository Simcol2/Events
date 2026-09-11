import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
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

// Shared by DecorCard and DecorDetailModal so the purchase-only rule and
// the tag list only live in one place.
export function getItemFlags(item) {
  const tags = parseItemTags(item);
  const outOfStock = (item.quantity_owned ?? 0) <= 0;
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
export default function DecorCard({ item, variants, groupName, onRent, onBuy, onOpenDetail }) {
  const hasVariants = Array.isArray(variants) && variants.length > 1;
  const [selectedId, setSelectedId] = useState(item.id);
  // Native <select> values are always strings, but item ids are numeric
  // (bigint from Supabase), so this compares both sides as strings rather
  // than risking a silent type-mismatch miss on strict equality.
  const active = hasVariants
    ? variants.find((v) => String(v.id) === String(selectedId)) || variants[0]
    : item;

  const { tags, outOfStock, isPurchasable, isRentable } = getItemFlags(active);
  const displayName = hasVariants ? groupName || active.name : active.name;
  const colorOptions = parseColorOptions(active);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "");

  return (
    <article
      onClick={() => onOpenDetail?.(active)}
      className={`group cursor-pointer overflow-hidden bg-white ${outOfStock ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[4/4.6] overflow-hidden bg-[#EEE9DC]">
        {normalizePhotos(active.photos).length ? (
          <PhotoCarousel
            photos={active.photos}
            alt={itemAltText(displayName, { color: selectedColor })}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-[Space_Grotesk] text-sm tracking-[0.2em] text-[#5A5F54]">PHOTO COMING SOON</span>
          </div>
        )}
        {outOfStock && (
          <div className="absolute left-3 top-3 bg-[#FCFBF7]/95 px-3 py-1.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em] text-[#7B7464]">
            OUT OF STOCK
          </div>
        )}
      </div>

      <div className="px-1 pb-3 pt-4">
        <div className="font-[Space_Grotesk] text-sm font-medium uppercase tracking-[0.18em] text-[#5A5F54]">
          {tags.length ? tags.join(" · ") : "Decor"}
        </div>
        <h3 className="mt-1 font-['Fraunces'] text-[25px] font-semibold leading-[1] text-[#0B4933]">
          {displayName}
        </h3>
        {colorOptions.length > 1 ? (
          <div className="mt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="font-[Space_Grotesk] text-sm text-[#8C846F]">Color:</span>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="rounded-sm border border-[#D8D0BC] bg-white px-2 py-1 font-[Space_Grotesk] text-sm text-[#0B4933] outline-none focus:border-[#0B4933]"
            >
              {colorOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        ) : colorOptions.length === 1 ? (
          <div className="mt-1 font-[Space_Grotesk] text-sm text-[#8C846F]">Color: {colorOptions[0]}</div>
        ) : null}
        {active.size && (
          <div className="mt-2 font-[Space_Grotesk] text-sm text-[#8C846F]">{active.size}</div>
        )}

        {hasVariants && (
          <div className="relative mt-3" onClick={(e) => e.stopPropagation()}>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none border border-[#D8D0BC] bg-white px-3 py-2 font-[Space_Grotesk] text-sm text-[#12201A] outline-none focus:border-[#0B4933]"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.variant_label || v.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8C846F]" />
          </div>
        )}

        <div className="mt-3 space-y-2 border-t border-[#EAE3D3] pt-3">
          {isPurchasable && (
            <div className="flex items-end justify-between">
              <span className="font-[Space_Grotesk] text-sm font-medium tracking-[0.08em] text-[#8A6A1E]">
                BUY ${active.purchase_price}
              </span>
              {outOfStock ? (
                <span className="font-[Space_Grotesk] text-sm tracking-[0.08em] text-[#9C947F]">UNAVAILABLE</span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy?.(active);
                  }}
                  className="font-[Space_Grotesk] text-sm font-semibold tracking-[0.14em] text-[#0B4933] underline underline-offset-4"
                >
                  {active.quantity_owned} AVAILABLE - INQUIRE
                </button>
              )}
            </div>
          )}

          {isRentable && !outOfStock && (
            <div className="flex items-end justify-between">
              <span className="font-[Space_Grotesk] text-sm font-medium tracking-[0.08em] text-[#8A6A1E]">
                RENT ${active.rental_price} / EVENT
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRent?.(active);
                }}
                className="font-[Space_Grotesk] text-sm font-semibold tracking-[0.14em] text-[#0B4933] underline underline-offset-4"
              >
                CHECK DATES
              </button>
            </div>
          )}

          {!isPurchasable && !isRentable && (
            <div className="flex items-end justify-between">
              <span className="font-[Space_Grotesk] text-sm font-medium tracking-[0.08em] text-[#8A6A1E]">INQUIRE</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
