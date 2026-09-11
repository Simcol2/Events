import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

const YOUR_CHOICE = "__yourChoice__";

function firstPhoto(photos) {
  if (!Array.isArray(photos) || !photos.length) return null;
  return photos[0];
}

// Opens when a customer clicks a customizable gift (e.g. Pop Up Nostalgia
// Cards): a dropdown of preset designs from `gift.options`, plus a "Your
// Choice" option (only shown when gift.allow_custom_text is true) that
// reveals a text input for the show/character they want instead. Adding to
// cart passes the selection along as cart line metadata - see
// CartContext's `meta` support.
export default function CustomizableGiftModal({ gift, onClose, onAdd }) {
  const [selected, setSelected] = useState(gift.options?.[0]?.label || (gift.allow_custom_text ? YOUR_CHOICE : ""));
  const [customText, setCustomText] = useState("");

  const isCustom = selected === YOUR_CHOICE;
  const selectedOption = !isCustom ? gift.options?.find((o) => o.label === selected) : null;
  const photo = selectedOption?.photo_url || firstPhoto(gift.photos);
  const price = isCustom ? gift.custom_price ?? gift.price : gift.price;
  const canAdd = isCustom ? customText.trim().length > 0 : Boolean(selected);

  const handleAdd = () => {
    if (!canAdd) return;
    const meta = isCustom ? { custom: customText.trim() } : { selection: selected };
    onAdd(meta);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${gift.name}`}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#FCFBF7] px-6 py-8 sm:px-8"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#5A5F54]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EEE9DC]">
          {photo ? (
            <img src={photo} alt={selectedOption?.label || gift.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-[Space_Grotesk] text-sm tracking-[0.2em] text-[#5A5F54]">PHOTO COMING SOON</span>
            </div>
          )}
        </div>

        <h2 className="mt-5 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">{gift.name}</h2>
        {gift.tagline && <p className="mt-1 font-[Space_Grotesk] text-sm italic text-[#8A6A1E]">{gift.tagline}</p>}
        {gift.description && <p className="mt-3 font-[Space_Grotesk] text-base leading-6 text-[#5C5645]">{gift.description}</p>}

        <label className="mt-5 block font-[Space_Grotesk] text-sm font-semibold tracking-[0.15em] text-[#0B4933]">
          CHOOSE A DESIGN
        </label>
        <div className="relative mt-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full appearance-none rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 font-[Space_Grotesk] text-base text-[#12201A] outline-none focus:border-[#0B4933]"
          >
            {(gift.options || []).map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
              </option>
            ))}
            {gift.allow_custom_text && <option value={YOUR_CHOICE}>Your Choice</option>}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8C846F]" />
        </div>

        {isCustom && (
          <div className="mt-4">
            <label className="block font-[Space_Grotesk] text-sm font-semibold tracking-[0.15em] text-[#0B4933]">
              WHAT SHOW OR CHARACTER?
            </label>
            <input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Bluey, Sesame Street, Paw Patrol..."
              className="mt-2 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 font-[Space_Grotesk] text-base text-[#12201A] outline-none focus:border-[#0B4933]"
            />
            <p className="mt-2 font-[Space_Grotesk] text-sm text-[#8C846F]">
              We'll create this design for you. Custom requests are priced at ${gift.custom_price ?? gift.price}.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[#EAE3D3] pt-4">
          <span className="font-[Space_Grotesk] text-base font-semibold text-[#8A6A1E]">${price}</span>
          <button
            disabled={!canAdd}
            onClick={handleAdd}
            className="rounded-full bg-[#0B4933] px-6 py-3 font-[Space_Grotesk] text-sm font-semibold tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}
