import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { normalizePhotos } from "./PhotoCarousel";
import { parseColorOptions, plainDescription } from "./DecorCard";
import { rgba } from "./EditorialKit";

const money = (value) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(Number(value));

export default function TableBoxProductCard({
  item, displayName, category, variants, count, onVariantChange, onQuantityChange, onDetails,
}) {
  const { palette, fonts } = usePalette();
  const [photoIndex, setPhotoIndex] = useState(0);
  useEffect(() => setPhotoIndex(0), [item.id]);
  const photos = normalizePhotos(item.photos);
  const currentPhoto = photoIndex < photos.length ? photoIndex : 0;
  const colors = parseColorOptions(item);
  const rental = item.rental_price != null;
  const price = rental ? item.rental_price : item.purchase_price;

  return (
    <article
      className="grid min-w-0 overflow-hidden rounded-lg border sm:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]"
      style={{ borderColor: count ? palette.accent : palette.line, background: palette.surface }}
      aria-label={displayName}
    >
      <div className="min-w-0 border-b sm:border-b-0 sm:border-r" style={{ background: "#FBF9F3", borderColor: palette.line }}>
        <div className="relative aspect-square">
          <button type="button" onClick={onDetails} className="h-full w-full p-3" aria-label={"View details for " + displayName}>
            {photos.length ? (
              <img src={photos[currentPhoto]} alt={displayName} loading="lazy" className="h-full w-full object-contain" />
            ) : (
              <span style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px", letterSpacing: ".12em" }}>PHOTO COMING SOON</span>
            )}
          </button>
          {photos.length > 1 && (
            <>
              <button type="button" onClick={() => setPhotoIndex((currentPhoto - 1 + photos.length) % photos.length)}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm"
                style={{ color: palette.primaryDeep }} aria-label={"Previous photo of " + displayName}>
                <ChevronLeft size={17} />
              </button>
              <button type="button" onClick={() => setPhotoIndex((currentPhoto + 1) % photos.length)}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm"
                style={{ color: palette.primaryDeep }} aria-label={"Next photo of " + displayName}>
                <ChevronRight size={17} />
              </button>
            </>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-3 pb-3">
            {photos.map((src, index) => (
              <button key={index} type="button" onClick={() => setPhotoIndex(index)}
                className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm border bg-white"
                style={{ borderColor: currentPhoto === index ? palette.accent : palette.line }}
                aria-label={"Photo " + (index + 1) + " of " + displayName} aria-pressed={currentPhoto === index}>
                <img src={src} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <p style={{ ...fonts.bodyFont, color: palette.accent, fontSize: "10px", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>
          {item.brand || category}
        </p>
        <h3 className="mt-2 break-words" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "24px", fontWeight: 650, lineHeight: 1.1 }}>
          <button type="button" className="text-left" onClick={onDetails}>{displayName}</button>
        </h3>
        {(colors.length > 0 || item.size) && (
          <p className="mt-3" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "12px", lineHeight: 1.5 }}>
            {[colors.join(" / "), item.size].filter(Boolean).join(" · ")}
          </p>
        )}
        {item.description && (
          <p className="mt-3 line-clamp-3" style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "13px", lineHeight: 1.65 }}>
            {plainDescription(item.description)}
          </p>
        )}
        <button type="button" onClick={onDetails} className="mt-3 self-start text-left underline underline-offset-4"
          style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "12px", fontWeight: 600 }}>
          View details
        </button>

        {variants && (
          <div className="relative mt-4">
            <select value={item.id} onChange={(event) => onVariantChange(Number(event.target.value))}
              aria-label={"Choose " + displayName + " option"}
              className="w-full min-w-0 appearance-none rounded-sm border bg-white py-2.5 pl-3 pr-8 text-xs"
              style={{ ...fonts.bodyFont, borderColor: palette.line, color: palette.ink }}>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.variant_label || variant.name} ({money(variant.rental_price ?? variant.purchase_price)})
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="border-t pt-4" style={{ borderColor: palette.line }}>
            <p style={{ ...fonts.displayFont, color: palette.accent, fontSize: "28px", fontWeight: 650, lineHeight: 1 }}>
              {money(price)}
            </p>
            <p className="mt-1" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase" }}>
              {rental ? "Rental · each per event" : "Purchase · each"}
            </p>
            {rental && item.bulk_min_quantity != null && item.bulk_rental_price != null && (
              <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.accent, fontSize: "12px", fontWeight: 600 }}>
                {money(item.bulk_rental_price)} each for {item.variant_group ? "any " : ""}{item.bulk_min_quantity}+{item.variant_group ? ", mix and match" : ""}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px" }}>Quantity</span>
              <div className="flex items-center gap-1 rounded-full border p-1" style={{ borderColor: count ? palette.accent : palette.line, background: count ? rgba(palette.accent, .04) : "transparent" }}>
                <button type="button" onClick={() => onQuantityChange(count - 1)} disabled={count === 0}
                  aria-label={"Decrease " + displayName + " quantity"} className="flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40" style={{ color: palette.primaryDeep }}>
                  <Minus size={15} />
                </button>
                <input type="number" min="0" step="1" value={count} onChange={(event) => onQuantityChange(event.target.value)}
                  aria-label={displayName + " quantity"} className="w-10 min-w-0 bg-transparent text-center text-sm"
                  style={{ ...fonts.bodyFont, color: palette.ink }} />
                <button type="button" onClick={() => onQuantityChange(count + 1)}
                  aria-label={"Increase " + displayName + " quantity"} className="flex h-10 w-10 items-center justify-center rounded-full" style={{ color: palette.primaryDeep }}>
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
