import React, { useState } from "react";
import { X } from "lucide-react";
import { getItemFlags } from "./DecorCard";

function photoList(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.map((p) => (typeof p === "string" ? p : p?.url)).filter(Boolean);
}

// Full detail view opened by clicking a decor card - same Buy/Rent actions
// as the card itself, just with room for the description and every photo,
// plus a route to the package builder for anyone who wants this piece as
// part of a curated package (Setup items there come from a fixed list, not
// the live catalog, so this modal doesn't add straight to a package).
export default function DecorDetailModal({ item, onClose, onRent, onBuy, navigate }) {
  const { tags, outOfStock, isPurchasable, isRentable } = getItemFlags(item);
  const photos = photoList(item.photos);
  const [activePhoto, setActivePhoto] = useState(0);

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div
        className="relative grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-y-auto rounded-2xl bg-[#FAF6ED] sm:grid-cols-2"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF6ED]/90 text-[#4E5A44]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="relative aspect-square bg-[#EEE9DC] sm:aspect-auto">
          {photos.length ? (
            <img src={photos[activePhoto] || photos[0]} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-[Jost] text-[10px] tracking-[0.2em] text-[#A69C7E]">PHOTO COMING SOON</span>
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
                    border: i === activePhoto ? "2px solid #4E5A44" : "2px solid #FFFFFF",
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
          <div className="font-[Jost] text-[9px] font-medium uppercase tracking-[0.18em] text-[#A69C7E]">
            {tags.length ? tags.join(" · ") : "Decor"}
          </div>
          <h2 className="mt-1 font-['Cormorant_Garamond'] text-3xl font-semibold text-[#4E5A44]">{item.name}</h2>
          {item.size && <div className="mt-2 font-[Jost] text-xs text-[#8C846F]">{item.size}</div>}
          {item.description && (
            <p className="mt-4 font-[Jost] text-sm leading-6 text-[#5C5645]">{item.description}</p>
          )}

          <div className="mt-6 space-y-3 border-t border-[#E4DCC8] pt-5">
            {isPurchasable && (
              <div className="flex items-center justify-between">
                <span className="font-[Jost] text-sm font-medium text-[#B8935A]">BUY ${item.purchase_price}</span>
                {outOfStock ? (
                  <span className="font-[Jost] text-[10px] tracking-[0.08em] text-[#9C947F]">UNAVAILABLE</span>
                ) : (
                  <button
                    onClick={() => onBuy?.(item)}
                    className="rounded-full bg-[#4E5A44] px-5 py-2.5 font-[Jost] text-[10px] font-semibold tracking-[0.16em] text-white"
                  >
                    PURCHASE
                  </button>
                )}
              </div>
            )}

            {isRentable && !outOfStock && (
              <div className="flex items-center justify-between">
                <span className="font-[Jost] text-sm font-medium text-[#B8935A]">RENT ${item.rental_price} / EVENT</span>
                <button
                  onClick={() => onRent?.(item)}
                  className="rounded-full border border-[#4E5A44] px-5 py-2.5 font-[Jost] text-[10px] font-semibold tracking-[0.16em] text-[#4E5A44]"
                >
                  CHECK DATES
                </button>
              </div>
            )}

            {!isPurchasable && !isRentable && (
              <p className="font-[Jost] text-sm text-[#B8935A]">Contact us to inquire about this piece.</p>
            )}
          </div>

          <button
            onClick={() => navigate?.("/package-builder")}
            className="mt-3 w-full border border-[#B8935A] py-3 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]"
          >
            BUILD YOUR PACKAGE
          </button>
        </div>
      </div>
    </div>
  );
}
