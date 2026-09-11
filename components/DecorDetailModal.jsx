import React, { useState } from "react";
import { X } from "lucide-react";
import { getItemFlags, parseColorOptions } from "./DecorCard";
import { itemAltText } from "../seo";
import { useEventType } from "../EventTypeContext";

function photoList(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.map((p) => (typeof p === "string" ? p : p?.url)).filter(Boolean);
}

// Full detail view opened by clicking a decor card - same Buy/Rent actions
// as the card itself, just with room for the description and every photo,
// plus a route to the package builder for anyone who wants this piece as
// part of a curated package (Setup items there come from a fixed list, not
// the live catalog, so this modal doesn't add straight to a package).
export default function DecorDetailModal({ item, onClose, onRent, onBuy }) {
  const { openPickerForBuilder } = useEventType();
  const { tags, outOfStock, isPurchasable, isRentable } = getItemFlags(item);
  const photos = photoList(item.photos);
  const [activePhoto, setActivePhoto] = useState(0);
  const colorOptions = parseColorOptions(item);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "");

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div
        className="relative grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-y-auto rounded-2xl bg-[#FCFBF7] sm:grid-cols-2"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#FCFBF7]/90 text-[#0B4933]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="relative aspect-square bg-[#EEE9DC] sm:aspect-auto">
          {photos.length ? (
            <img
              src={photos[activePhoto] || photos[0]}
              alt={itemAltText(item.name, { color: parseColorOptions(item)[0] })}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-[Space_Grotesk] text-sm tracking-[0.2em] text-[#5A5F54]">PHOTO COMING SOON</span>
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
          <div className="font-[Space_Grotesk] text-sm font-medium uppercase tracking-[0.18em] text-[#5A5F54]">
            {tags.length ? tags.join(" · ") : "Decor"}
          </div>
          <h2 className="mt-1 font-['Fraunces'] text-3xl font-semibold text-[#0B4933]">{item.name}</h2>
          {colorOptions.length > 1 ? (
            <div className="mt-1 flex items-center gap-2">
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
          {item.size && <div className="mt-2 font-[Space_Grotesk] text-sm text-[#8C846F]">{item.size}</div>}
          {item.description && (
            <p className="mt-4 font-[Space_Grotesk] text-base leading-6 text-[#5C5645]">{item.description}</p>
          )}

          <div className="mt-6 space-y-3 border-t border-[#EAE3D3] pt-5">
            {isPurchasable && (
              <div className="flex items-center justify-between">
                <span className="font-[Space_Grotesk] text-base font-medium text-[#8A6A1E]">BUY ${item.purchase_price}</span>
                {outOfStock ? (
                  <span className="font-[Space_Grotesk] text-sm tracking-[0.08em] text-[#9C947F]">UNAVAILABLE</span>
                ) : (
                  <button
                    onClick={() => onBuy?.(item)}
                    className="rounded-full bg-[#0B4933] px-5 py-2.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em] text-white"
                  >
                    PURCHASE
                  </button>
                )}
              </div>
            )}

            {isRentable && !outOfStock && (
              <div className="flex items-center justify-between">
                <span className="font-[Space_Grotesk] text-base font-medium text-[#8A6A1E]">RENT ${item.rental_price} / EVENT</span>
                <button
                  onClick={() => onRent?.(item)}
                  className="rounded-full border border-[#0B4933] px-5 py-2.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em] text-[#0B4933]"
                >
                  CHECK DATES
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
