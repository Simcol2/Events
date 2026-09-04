import React from "react";

function firstPhoto(photos) {
  if (!photos || !Array.isArray(photos) || !photos.length) return null;
  const first = photos[0];
  return typeof first === "string" ? first : first?.url || null;
}

// Gift wrap and disposables are purchase-only by business rule, enforced
// here rather than relying only on the sheet leaving rental_price blank.
// Matched case-insensitively since the sheet's tags column is typed by
// hand.
const PURCHASE_ONLY_TAGS = ["gift wrap", "disposables"];

// Shared by DecorCard and DecorDetailModal so the purchase-only rule and
// the tag list only live in one place.
export function getItemFlags(item) {
  const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
  const outOfStock = (item.quantity_owned ?? 0) <= 0;
  const isPurchasable = item.purchase_price != null;
  const isPurchaseOnly = tags.some((t) => PURCHASE_ONLY_TAGS.includes(String(t).toLowerCase().trim()));
  const isRentable = item.rental_price != null && !isPurchaseOnly;
  return { tags, outOfStock, isPurchasable, isRentable };
}

export default function DecorCard({ item, onRent, onBuy, onOpenDetail }) {
  const photo = firstPhoto(item.photos);
  const { tags, outOfStock, isPurchasable, isRentable } = getItemFlags(item);

  return (
    <article
      onClick={() => onOpenDetail?.(item)}
      className={`group cursor-pointer overflow-hidden bg-white ${outOfStock ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[4/4.6] overflow-hidden bg-[#EEE9DC]">
        {photo ? (
          <img
            src={photo}
            alt={item.name}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-[Jost] text-[10px] tracking-[0.2em] text-[#A69C7E]">PHOTO COMING SOON</span>
          </div>
        )}
        {outOfStock && (
          <div className="absolute left-3 top-3 bg-[#FAF6ED]/95 px-3 py-1.5 font-[Jost] text-[9px] font-semibold tracking-[0.16em] text-[#7B7464]">
            OUT OF STOCK
          </div>
        )}
      </div>

      <div className="px-1 pb-3 pt-4">
        <div className="font-[Jost] text-[9px] font-medium uppercase tracking-[0.18em] text-[#A69C7E]">
          {tags.length ? tags.join(" · ") : "Decor"}
        </div>
        <h3 className="mt-1 font-['Cormorant_Garamond'] text-[25px] font-semibold leading-[1] text-[#4E5A44]">
          {item.name}
        </h3>
        {item.size && (
          <div className="mt-2 font-[Jost] text-[10px] text-[#8C846F]">{item.size}</div>
        )}

        <div className="mt-3 space-y-2 border-t border-[#E4DCC8] pt-3">
          {isPurchasable && (
            <div className="flex items-end justify-between">
              <span className="font-[Jost] text-[11px] font-medium tracking-[0.08em] text-[#B8935A]">
                BUY ${item.purchase_price}
              </span>
              {outOfStock ? (
                <span className="font-[Jost] text-[9px] tracking-[0.08em] text-[#9C947F]">UNAVAILABLE</span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy?.(item);
                  }}
                  className="font-[Jost] text-[9px] font-semibold tracking-[0.14em] text-[#4E5A44] underline underline-offset-4"
                >
                  {item.quantity_owned} AVAILABLE - INQUIRE
                </button>
              )}
            </div>
          )}

          {isRentable && !outOfStock && (
            <div className="flex items-end justify-between">
              <span className="font-[Jost] text-[11px] font-medium tracking-[0.08em] text-[#B8935A]">
                RENT ${item.rental_price} / EVENT
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRent?.(item);
                }}
                className="font-[Jost] text-[9px] font-semibold tracking-[0.14em] text-[#4E5A44] underline underline-offset-4"
              >
                CHECK DATES
              </button>
            </div>
          )}

          {!isPurchasable && !isRentable && (
            <div className="flex items-end justify-between">
              <span className="font-[Jost] text-[11px] font-medium tracking-[0.08em] text-[#B8935A]">INQUIRE</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
