import React from "react";

function firstPhoto(photos) {
  if (!photos || !Array.isArray(photos) || !photos.length) return null;
  const first = photos[0];
  return typeof first === "string" ? first : first?.url || null;
}

export default function DecorCard({ item }) {
  const photo = firstPhoto(item.photos);
  const unavailable = (item.quantity_owned ?? 0) <= 0;

  return (
    <article className={`group overflow-hidden bg-white ${unavailable ? "opacity-60" : ""}`}>
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
        {unavailable && (
          <div className="absolute left-3 top-3 bg-[#FAF6ED]/95 px-3 py-1.5 font-[Jost] text-[9px] font-semibold tracking-[0.16em] text-[#7B7464]">
            CURRENTLY BOOKED
          </div>
        )}
      </div>

      <div className="px-1 pb-3 pt-4">
        <div className="font-[Jost] text-[9px] font-medium uppercase tracking-[0.18em] text-[#A69C7E]">
          {item.category || "Decor"}
        </div>
        <h3 className="mt-1 font-['Cormorant_Garamond'] text-[25px] font-semibold leading-[1] text-[#4E5A44]">
          {item.name}
        </h3>
        {item.size && (
          <div className="mt-2 font-[Jost] text-[10px] text-[#8C846F]">{item.size}</div>
        )}
        <div className="mt-3 flex items-end justify-between border-t border-[#E4DCC8] pt-3">
          <span className="font-[Jost] text-[11px] font-medium tracking-[0.08em] text-[#B8935A]">
            {item.rental_price != null ? `$${item.rental_price} / EVENT` : "INQUIRE"}
          </span>
          <span className="font-[Jost] text-[9px] tracking-[0.08em] text-[#9C947F]">
            {unavailable ? "UNAVAILABLE" : `${item.quantity_owned ?? 0} AVAILABLE`}
          </span>
        </div>
      </div>
    </article>
  );
}
