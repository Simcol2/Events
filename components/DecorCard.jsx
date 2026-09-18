import React, { useState } from "react";
import { Check, Plus } from "lucide-react";
import PhotoCarousel, { normalizePhotos } from "./PhotoCarousel";
import { itemAltText } from "../seo";
import { useCart } from "../CartContext";

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

// Catalog descriptions can carry **bold** lead-ins and blank-line breaks
// for the detail view, which renders them as real formatting. Everywhere
// that shows the same text as a plain one or two line preview strips the
// markers instead of printing literal asterisks.
export function plainDescription(text) {
  if (typeof text !== "string") return text;
  return text.replace(/\*\*/g, "").replace(/\s*\n+\s*/g, " ").trim();
}

// Shared by DecorCard and DecorDetailModal so the purchase-only rule and
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

// Sizing/price choices are made in the detail view (DecorDetailModal), not
// on the grid - a dropdown per card reads as clunky at a glance. The grid
// just needs to default to the cheapest variant (the smallest size, in
// practice) so the photo and starting price it shows are representative.
export function sortVariantsByPrice(list) {
  return [...list].sort((a, b) => variantPrice(a) - variantPrice(b));
}

export default function DecorCard({ item, variants, groupName, onRent, onBuy, onOpenDetail }) {
  const { isInCart, removeFromCart } = useCart();
  const hasVariants = Array.isArray(variants) && variants.length > 1;
  const colorOptionsForItem = parseColorOptions(item);
  const hasChoice = hasVariants || colorOptionsForItem.length > 1;
  // The grid always shows the cheapest/default variant - selecting a
  // different size or color happens after clicking through to the detail
  // view (see onOpenDetail below), so there's no local selection state to
  // track here anymore.
  const active = hasVariants ? sortVariantsByPrice(variants)[0] : item;

  const { tags, outOfStock, isPurchasable, isRentable } = getItemFlags(active);
  const inPurchaseCart = isInCart(active.id, "catalog");
  const inRentalCart = isInCart(active.id, "rental");
  const displayName = hasVariants ? groupName || active.name : active.name;
  const colorOptions = parseColorOptions(active);
  const startingPrice = hasVariants ? Math.min(...variants.map(variantPrice)) : null;
  const startingIsRental = hasVariants
    ? sortVariantsByPrice(variants).find((v) => variantPrice(v) === startingPrice)?.rental_price != null
    : null;

  return (
    <article
      onClick={() => onOpenDetail?.(active, variants, groupName)}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden bg-white ${outOfStock ? "opacity-60" : ""}`}
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

      <div className="flex flex-1 flex-col px-1 pb-3 pt-4">
        <div className="font-[Space_Grotesk] text-[11px] font-medium uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-sm sm:tracking-[0.18em]">
          {tags.length ? tags.join(" · ") : "Decor"}
        </div>
        <h3 className="mt-1 font-['Fraunces'] text-lg font-semibold leading-[1.1] text-[#0B4933] sm:text-[25px] sm:leading-[1]">
          {displayName}
        </h3>
        {active.size && (
          <div className="mt-2 font-[Space_Grotesk] text-xs text-[#8C846F] sm:text-sm">{active.size}</div>
        )}

        {/* Sizing, color and any other variant choice happens in the
            detail view once someone clicks through - the grid only ever
            shows a starting price or a single-option Buy/Rent action, no
            dropdowns here. */}
        <div className="mt-auto space-y-2 border-t border-[#E6E6E6] pt-3">
          {hasChoice ? (
            <div className="flex items-end justify-between">
              <span className="font-[Space_Grotesk] text-xs font-medium tracking-[0.06em] text-[#8A6A1E] sm:text-sm sm:tracking-[0.08em]">
                {hasVariants
                  ? `STARTING AT $${startingPrice}${startingIsRental ? " / EVENT" : ""}`
                  : isRentable
                    ? `RENT $${active.rental_price} / EVENT`
                    : isPurchasable
                      ? `BUY $${active.purchase_price}`
                      : "INQUIRE"}
              </span>
              <span className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-[#0B4933] sm:text-sm sm:tracking-[0.14em]">
                VIEW OPTIONS
              </span>
            </div>
          ) : (
            <>
              {isPurchasable && (
                <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
                  <span className="font-[Space_Grotesk] text-xs font-medium tracking-[0.06em] text-[#8A6A1E] sm:text-sm sm:tracking-[0.08em]">
                    BUY ${active.purchase_price}
                  </span>
                  {outOfStock ? (
                    <span className="font-[Space_Grotesk] text-xs tracking-[0.06em] text-[#9C947F] sm:text-sm sm:tracking-[0.08em]">UNAVAILABLE</span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        inPurchaseCart ? removeFromCart(active.id, "catalog") : onBuy?.(active);
                      }}
                      className="flex items-center gap-1.5 font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-[#0B4933] underline underline-offset-4 sm:text-sm sm:tracking-[0.14em]"
                    >
                      {inPurchaseCart ? <Check size={13} /> : <Plus size={13} />}
                      {inPurchaseCart ? "IN CART" : "ADD TO CART"}
                    </button>
                  )}
                </div>
              )}

              {isRentable && !outOfStock && (
                <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
                  <span className="font-[Space_Grotesk] text-xs font-medium tracking-[0.06em] text-[#8A6A1E] sm:text-sm sm:tracking-[0.08em]">
                    RENT ${active.rental_price} / EVENT
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      inRentalCart ? removeFromCart(active.id, "rental") : onRent?.(active);
                    }}
                    className="flex items-center gap-1.5 font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-[#0B4933] underline underline-offset-4 sm:text-sm sm:tracking-[0.14em]"
                  >
                    {inRentalCart ? <Check size={13} /> : <Plus size={13} />}
                    {inRentalCart ? "IN CART" : "ADD TO CART"}
                  </button>
                </div>
              )}

              {!isPurchasable && !isRentable && (
                <div className="flex items-end justify-between">
                  <span className="font-[Space_Grotesk] text-xs font-medium tracking-[0.06em] text-[#8A6A1E] sm:text-sm sm:tracking-[0.08em]">INQUIRE</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
