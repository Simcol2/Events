import React, { useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { getItemFlags, parseColorOptions, sortVariantsByPrice } from "./DecorCard";
import { normalizePhotos as photoList } from "./PhotoCarousel";
import { itemAltText } from "../seo";
import { useEventType } from "../EventTypeContext";
import { useCart } from "../CartContext";

// Item descriptions are written with blank lines between sections,
// **bold** lead-ins, and "- " bullet lines, so a long description reads
// as scannable blocks rather than one unbroken wall of text. Text with
// none of those markers renders as a single paragraph, exactly as before.
function inlineChunks(text, { blockBold }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong
        key={i}
        className={`font-semibold text-[#0B4933] ${blockBold ? "block" : ""}`}
      >
        {chunk.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{chunk}</React.Fragment>
    )
  );
}

function DescriptionBody({ text }) {
  const blocks = String(text)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length && lines.every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="mt-2 list-disc space-y-1 pl-5">
          {lines.map((line, j) => (
            <li key={j} className="font-[Space_Grotesk] text-base leading-6 text-[#5C5645]">
              {inlineChunks(line.slice(2), { blockBold: false })}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="mt-3 font-[Space_Grotesk] text-base leading-6 text-[#5C5645] first:mt-4">
        {inlineChunks(block, { blockBold: true })}
      </p>
    );
  });
}

// Full detail view opened by clicking a decor card - this is where sizing,
// color and any other variant choice actually happens (the grid card only
// ever shows a starting price), plus room for the description and every
// photo, and a route to the package builder for anyone who wants this piece
// as part of a curated package (Setup items there come from a fixed list,
// not the live catalog, so this modal doesn't add straight to a package).
export default function DecorDetailModal({ item, variants, groupName, onClose, onRent, onBuy }) {
  const { openPickerForBuilder } = useEventType();
  const { isInCart, removeFromCart } = useCart();
  const hasVariants = Array.isArray(variants) && variants.length > 1;
  const sortedVariants = hasVariants ? sortVariantsByPrice(variants) : null;
  const [selectedId, setSelectedId] = useState(item.id);
  const active = hasVariants
    ? sortedVariants.find((v) => String(v.id) === String(selectedId)) || sortedVariants[0]
    : item;

  const inPurchaseCart = isInCart(active.id, "catalog");
  const inRentalCart = isInCart(active.id, "rental");
  const { tags, outOfStock, isPurchasable, isRentable } = getItemFlags(active);
  const photos = photoList(active.photos);
  const [activePhoto, setActivePhoto] = useState(0);
  const colorOptions = parseColorOptions(active);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "");
  const displayName = hasVariants ? groupName || active.name : active.name;
  const baseItem = hasVariants ? sortedVariants[0] : item;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={displayName}
    >
      <div
        className="relative grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-y-auto rounded-2xl bg-[#FFFFFF] sm:grid-cols-2"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF]/90 text-[#0B4933]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="relative aspect-square bg-[#EEE9DC] sm:aspect-auto">
          {photos.length ? (
            <img
              src={photos[activePhoto] || photos[0]}
              alt={itemAltText(displayName, { color: colorOptions[0] })}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-[Space_Grotesk] text-sm tracking-[0.2em] text-[#6B6B6B]">PHOTO COMING SOON</span>
            </div>
          )}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3 sm:absolute sm:bottom-0 sm:left-0 sm:right-0">
              {photos.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm"
                  style={{
                    border: i === activePhoto ? "2px solid #0B4933" : "2px solid #FFFFFF",
                    opacity: i === activePhoto ? 1 : 0.75,
                  }}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-8 sm:px-8">
          <div className="font-[Space_Grotesk] text-sm font-medium uppercase tracking-[0.18em] text-[#6B6B6B]">
            {tags.length ? tags.join(" · ") : "Decor"}
          </div>
          <h2 className="mt-1 font-['Fraunces'] text-3xl font-semibold text-[#0B4933]">{displayName}</h2>

          {hasVariants && (
            <div className="relative mt-3 max-w-xs">
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setActivePhoto(0);
                }}
                className="w-full appearance-none rounded-sm border border-[#D9D9D9] bg-white px-3 py-2.5 font-[Space_Grotesk] text-sm text-[#292929] outline-none focus:border-[#0B4933]"
              >
                {sortedVariants.map((v) => {
                  const label = v.variant_label || v.name;
                  const priceLabel =
                    v.rental_price != null ? `$${v.rental_price} / event` : `$${v.purchase_price}`;
                  return (
                    <option key={v.id} value={v.id}>
                      {`${label} (${priceLabel})`}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8C846F]" />
            </div>
          )}

          {colorOptions.length > 1 ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="font-[Space_Grotesk] text-sm text-[#8C846F]">Color:</span>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="rounded-sm border border-[#D9D9D9] bg-white px-2 py-1 font-[Space_Grotesk] text-sm text-[#0B4933] outline-none focus:border-[#0B4933]"
              >
                {colorOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ) : colorOptions.length === 1 ? (
            <div className="mt-1 font-[Space_Grotesk] text-sm text-[#8C846F]">Color: {colorOptions[0]}</div>
          ) : null}
          {active.size && <div className="mt-2 font-[Space_Grotesk] text-sm text-[#8C846F]">{active.size}</div>}

          {/* Description and logistics come from the group's base variant,
              not the selected one, so the copy stays put while someone
              cycles through sizes instead of reflowing under them. The
              per-option prices already live in the dropdown. */}
          {baseItem.description && <DescriptionBody text={baseItem.description} />}

          {baseItem.condition_notes && (
            <p className="mt-3 font-[Space_Grotesk] text-sm leading-6 text-[#8C846F]">{baseItem.condition_notes}</p>
          )}

          <div className="mt-6 space-y-3 border-t border-[#E6E6E6] pt-5">
            {isPurchasable && (
              <div className="flex items-center justify-between">
                <span className="font-[Space_Grotesk] text-base font-medium text-[#8A6A1E]">BUY ${active.purchase_price}</span>
                {outOfStock ? (
                  <span className="font-[Space_Grotesk] text-sm tracking-[0.08em] text-[#9C947F]">UNAVAILABLE</span>
                ) : (
                  <button
                    onClick={() => (inPurchaseCart ? removeFromCart(active.id, "catalog") : onBuy?.(active))}
                    className="flex items-center gap-2 rounded-full px-5 py-2.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em]"
                    style={{
                      background: inPurchaseCart ? "transparent" : "#0B4933",
                      color: inPurchaseCart ? "#0B4933" : "#FFFFFF",
                      border: "1px solid #0B4933",
                    }}
                  >
                    {inPurchaseCart ? <Check size={14} /> : <Plus size={14} />}
                    {inPurchaseCart ? "IN CART" : "ADD TO CART"}
                  </button>
                )}
              </div>
            )}

            {isRentable && !outOfStock && (
              <div className="flex items-center justify-between">
                <span className="font-[Space_Grotesk] text-base font-medium text-[#8A6A1E]">RENT ${active.rental_price} / EVENT</span>
                <button
                  onClick={() => (inRentalCart ? removeFromCart(active.id, "rental") : onRent?.(active))}
                  className="flex items-center gap-2 rounded-full px-5 py-2.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em]"
                  style={{
                    background: inRentalCart ? "#0B4933" : "transparent",
                    color: inRentalCart ? "#FFFFFF" : "#0B4933",
                    border: "1px solid #0B4933",
                  }}
                >
                  {inRentalCart ? <Check size={14} /> : <Plus size={14} />}
                  {inRentalCart ? "IN CART" : "ADD TO CART"}
                </button>
              </div>
            )}

            {!isPurchasable && !isRentable && (
              <p className="font-[Space_Grotesk] text-base text-[#8A6A1E]">Contact us to inquire about this piece.</p>
            )}
          </div>

          <button
            onClick={() => openPickerForBuilder()}
            className="mt-3 w-full border border-[#8A6A1E] py-3 font-[Space_Grotesk] text-sm font-semibold tracking-[0.2em] text-[#0B4933]"
          >
            BUILD MY EXPERIENCE
          </button>
        </div>
      </div>
    </div>
  );
}
